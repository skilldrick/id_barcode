# concatenate the .js files then delete any '#include' lines.
cat barcode_library.js dropdown.js barcode_main.js | grep -Ev "#include" > id_barcode.jsx
