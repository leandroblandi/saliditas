#!/bin/bash
echo "Iniciando servicio Excel to Image..."
echo
echo "Instalando dependencias..."
pip install -r requirements.txt
echo
echo "Iniciando servidor en puerto 5001..."
python app.py
