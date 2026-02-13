$path = "Image\Weapons"
Get-ChildItem $path -Filter "*.png" | ForEach-Object {
    $originalName = $_.Name
    # Remove ALL underscores
    $cleanName = $originalName -replace "_", ""
    
    if ($originalName -ne $cleanName) {
        $newPath = Join-Path $path $cleanName
        Write-Host "Restoring: $originalName -> $cleanName"
        Move-Item $_.FullName -Destination $newPath -Force
    }
}
Write-Host "Filenames restored to CamelCase."
