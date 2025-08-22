#!/bin/bash

echo "Cleaning up orphaned backend processes..."
echo

echo "Stopping all ps-api processes..."
pkill -f ps-api

if [ $? -eq 0 ]; then
    echo "Backend processes stopped successfully."
else
    echo "No backend processes found or already stopped."
fi

echo
echo "Checking for remaining processes..."
ps aux | grep ps-api | grep -v grep

if [ $? -eq 0 ]; then
    echo "Some backend processes may still be running."
else
    echo "All backend processes have been cleaned up."
fi

echo
echo "Cleanup completed."
