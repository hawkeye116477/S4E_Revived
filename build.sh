#!/bin/bash

XPI_FILE=s4e-revived

path=$(dirname "$0")

cd $path/src

echo "Removing old xpi file"
if [ -f ../"$XPI_FILE.xpi" ]; then
    rm ../$XPI_FILE.xpi
fi

echo "Removing old xpt file"
if [ -f ./components/status4evar.xpt ]; then
    rm ./components/status4evar.xpt
fi

echo "Creating xpt file"
python2 $(xdg-user-dir DOWNLOAD)/firefox-sdk/sdk/bin/typelib.py ./components/status4evar.idl -o ./components/status4evar.xpt -I $(xdg-user-dir DOWNLOAD)/firefox-sdk/idl/

echo "Creating xpi file"
zip -r ../$XPI_FILE.xpi *
