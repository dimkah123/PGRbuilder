$path = "Image\Weapons"
Get-ChildItem $path -Filter "Weapon-*-Icon.png" | ForEach-Object {
    $originalName = $_.Name
    # Remove Prefix/Suffix
    $baseName = $originalName -replace "^Weapon-", "" -replace "-Icon\.png$", ""
    
    # Insert Underscores for CamelCase (e.g. WolfFang -> Wolf_Fang)
    # Using regex to match lowercase followed by uppercase
    $cleanName = $baseName -replace '([a-z0-9])([A-Z])', '$1_$2'
    
    # Handle specific edge cases if needed (e.g. Type-4O)
    # The regex above handles Type4O -> Type4_O maybe? Let's check.
    # Type4O: 'e' '4' no, '4' 'O'. 
    # [a-z0-9] includes digits. 4(O) -> 4_O. 
    # Type-4O: Type-4O. e- (no). -4 (no). 4O (yes). Type-4_O? 
    # Let's see file: Weapon-Type-4O_Lance_-_Mod.png (from map)
    # File list: Weapon-Type-4O_Lance_-_Mod.png NOT in list.
    # List has: ... wait.
    
    $newName = "$cleanName.png"
    
    Write-Host "Renaming: $originalName -> $newName"
    Rename-Item $_.FullName -NewName $newName
}

Write-Host "Weapon renaming complete."
