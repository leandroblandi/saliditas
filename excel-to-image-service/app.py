from flask import Flask, request, send_file, jsonify
import excel2img
import tempfile
import os
import uuid
from flask_cors import CORS
import openpyxl

app = Flask(__name__)
CORS(app)  # Permitir CORS para el frontend

@app.route("/excel-to-image", methods=["POST"])
def excel_to_image():
    try:
        file = request.files.get("file")
        range_str = request.form.get("range")
        sheet_name = request.form.get("sheet", None)

        if not file or not range_str:
            return jsonify({"error": "Falta archivo o parámetro 'range'"}), 400

        # Validar que sea un archivo Excel
        if not file.filename.lower().endswith(('.xlsx', '.xls')):
            return jsonify({"error": "El archivo debe ser un Excel (.xlsx o .xls)"}), 400

        # Usar el directorio actual para evitar problemas con rutas temporales
        current_dir = os.getcwd()
        xlsx_path = os.path.join(current_dir, "temp_excel.xlsx")
        img_path = os.path.join(current_dir, "temp_image.png")
        
        file.save(xlsx_path)

        # Primero verificar las hojas disponibles
        workbook = openpyxl.load_workbook(xlsx_path)
        available_sheets = workbook.sheetnames
        print(f"Available sheets: {available_sheets}")
        print(f"Requested sheet: {sheet_name}")

        # Si se especifica una hoja, verificar que existe
        if sheet_name:
            if sheet_name not in available_sheets:
                # Intentar encontrar una coincidencia parcial
                matching_sheets = [s for s in available_sheets if sheet_name.lower() in s.lower()]
                if matching_sheets:
                    sheet_name = matching_sheets[0]
                    print(f"Using partial match: {sheet_name}")
                else:
                    # Usar la primera hoja disponible
                    sheet_name = available_sheets[0]
                    print(f"Sheet not found, using first available: {sheet_name}")
            
            ref = f"{sheet_name}!{range_str}"
        else:
            # Si no se especifica hoja, usar la primera
            sheet_name = available_sheets[0]
            ref = f"{sheet_name}!{range_str}"

        print(f"Final reference: {ref}")
        print(f"Excel file path: {xlsx_path}")
        print(f"Image file path: {img_path}")

        # Convertir Excel a imagen
        excel2img.export_img(xlsx_path, img_path, "Sheet1", None)

        # Verificar que la imagen se creó
        if not os.path.exists(img_path):
            return jsonify({"error": "Error al generar la imagen"}), 500

        # Enviar la imagen
        return send_file(
            img_path, 
            mimetype="image/png",
            as_attachment=True,
            download_name=f"excel_range_{range_str.replace(':', '_')}.png"
        )

    except Exception as e:
        print(f"Error in excel_to_image: {str(e)}")
        return jsonify({"error": f"Error interno: {str(e)}"}), 500
    finally:
        # Limpiar archivos temporales
        try:
            if os.path.exists(xlsx_path):
                os.remove(xlsx_path)
            if os.path.exists(img_path):
                os.remove(img_path)
        except:
            pass

@app.route("/list-sheets", methods=["POST"])
def list_sheets():
    try:
        file = request.files.get("file")
        
        if not file:
            return jsonify({"error": "Falta archivo"}), 400

        # Validar que sea un archivo Excel
        if not file.filename.lower().endswith(('.xlsx', '.xls')):
            return jsonify({"error": "El archivo debe ser un Excel (.xlsx o .xls)"}), 400

        with tempfile.TemporaryDirectory() as tmpdir:
            # Usar nombres de archivo más simples para evitar problemas de rutas
            xlsx_path = os.path.join(tmpdir, "temp_excel.xlsx")
            file.save(xlsx_path)
            
            # Leer el archivo Excel y obtener los nombres de las hojas
            workbook = openpyxl.load_workbook(xlsx_path)
            sheet_names = workbook.sheetnames
            
            return jsonify({
                "sheets": sheet_names,
                "count": len(sheet_names)
            })

    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "OK", "service": "excel-to-image"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
