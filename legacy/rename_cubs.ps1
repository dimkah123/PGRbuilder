$path = "Image\CUB"
Get-ChildItem $path -Filter "CUB-*-Icon.png" | ForEach-Object {
    $originalName = $_.Name
    # Remove Prefix (CUB-) and Suffix (-Icon)
    # The user filenames have CamelCase inside dashes sometimes?
    # e.g. CUB-Beep-Boop-Icon.png -> Beep-Boop.png
    # CUB-JetJaeger-Icon.png -> JetJaeger.png
    
    $cleanName = $originalName -replace "^CUB-", "" -replace "-Icon\.png$", ".png"
    
    # Optional: Insert spaces? 
    # Let's keep it simple: Just strip the junk.
    # JetJaeger -> Jet Jaeger? 
    # The weapons logic failed on that. Let's stick to the extracted string.
    # We will map "Jet Jaeger" -> "JetJaeger.png" in the JS if needed.
    
    Write-Host "Renaming: $originalName -> $cleanName"
    Rename-Item $_.FullName -NewName $cleanName
}

Write-Host "CUB renaming complete."
