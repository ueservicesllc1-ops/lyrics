#!/bin/bash
cd ~/studio       # Asegúrate de que esta sea la ruta de tu proyecto
git add .
git commit -m "Respaldo automático: $(date +'%Y-%m-%d %H:%M:%S')"
git push origin main


