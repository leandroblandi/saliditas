#!/bin/bash
echo "Cleaning up Image Generator API service processes..."
echo
echo "Stopping all excel-image-generator-api processes..."
pkill -f "excel-image-generator-api"
if [ $? -eq 0 ]; then
    echo "Image Generator API service processes stopped successfully."
else
    echo "No Image Generator API service processes found or already stopped."
fi
echo
echo "Checking for remaining Image Generator API processes..."
ps aux | grep "excel-image-generator-api" | grep -v grep
if [ $? -eq 0 ]; then
    echo "Some Image Generator API processes may still be running."
else
    echo "All Image Generator API service processes have been cleaned up."
fi
echo
echo "Cleanup completed."
