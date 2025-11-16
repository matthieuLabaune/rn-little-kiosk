#!/bin/bash

# Script pour copier des vidéos vers la tablette
# Usage: ./copy-videos.sh [dossier_source]

DEVICE_ID="R9YTA088WHW"
APP_VIDEO_DIR="/data/data/com.rnparryhotterkiosk/files/videos"

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📹 Copie de vidéos vers la tablette${NC}"
echo ""

# Vérifier la connexion à la tablette
if ! adb -s $DEVICE_ID get-state >/dev/null 2>&1; then
    echo -e "${RED}❌ Tablette non connectée (device: $DEVICE_ID)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Tablette connectée${NC}"

# Dossier source (argument ou demande à l'utilisateur)
if [ -z "$1" ]; then
    echo -e "${YELLOW}📁 Entrez le chemin du dossier contenant vos vidéos:${NC}"
    read -r SOURCE_DIR
else
    SOURCE_DIR="$1"
fi

# Vérifier que le dossier existe
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}❌ Le dossier '$SOURCE_DIR' n'existe pas${NC}"
    exit 1
fi

# Créer le dossier sur la tablette s'il n'existe pas
echo -e "${BLUE}📂 Création du dossier sur la tablette...${NC}"
adb -s $DEVICE_ID shell "run-as com.rnparryhotterkiosk mkdir -p files/videos" 2>/dev/null

# Compter les vidéos
VIDEO_COUNT=$(find "$SOURCE_DIR" -maxdepth 1 \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.avi" -o -iname "*.mkv" -o -iname "*.webm" \) | wc -l | tr -d ' ')

if [ "$VIDEO_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Aucune vidéo trouvée dans '$SOURCE_DIR'${NC}"
    exit 0
fi

echo -e "${GREEN}📹 Trouvé $VIDEO_COUNT vidéo(s)${NC}"
echo ""

# Copier chaque vidéo
COPIED=0
FAILED=0

for video in "$SOURCE_DIR"/*.{mp4,MP4,mov,MOV,avi,AVI,mkv,MKV,webm,WEBM}; do
    # Vérifier que le fichier existe (évite les patterns non matchés)
    if [ ! -f "$video" ]; then
        continue
    fi

    filename=$(basename "$video")
    filesize=$(du -h "$video" | cut -f1)

    echo -e "${BLUE}⬆️  Copie de $filename ($filesize)...${NC}"

    # Copier vers /sdcard/ d'abord (accessible)
    if adb -s $DEVICE_ID push "$video" "/sdcard/Download/$filename" >/dev/null 2>&1; then
        # Puis copier vers le dossier de l'app avec run-as et dd
        if adb -s $DEVICE_ID shell "run-as com.rnparryhotterkiosk dd if=/sdcard/Download/$filename of=files/videos/$filename 2>/dev/null" >/dev/null 2>&1; then
            # Nettoyer le fichier temporaire
            adb -s $DEVICE_ID shell "rm /sdcard/Download/$filename" 2>/dev/null
            echo -e "${GREEN}   ✅ $filename copié${NC}"
            ((COPIED++))
        else
            echo -e "${RED}   ❌ Échec du déplacement de $filename${NC}"
            ((FAILED++))
        fi
    else
        echo -e "${RED}   ❌ Échec de l'envoi de $filename${NC}"
        ((FAILED++))
    fi
done

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Terminé !${NC}"
echo -e "${BLUE}   • $COPIED vidéo(s) copiée(s)${NC}"
if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}   • $FAILED échec(s)${NC}"
fi
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}💡 Redémarrez l'application pour voir les nouvelles vidéos${NC}"
