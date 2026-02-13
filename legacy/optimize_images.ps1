$sourceDir = "c:\Users\Dimka\Desktop\PGRBuilder\Image\Characters"
$destDir = "c:\Users\Dimka\Desktop\PGRBuilder\Image\Characters\Compressed"
$maxWidth = 1080

# Create destination directory if it doesn't exist
if (!(Test-Path -Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
    Write-Host "Created directory: $destDir" -ForegroundColor Green
}

# Check if ffmpeg is available
try {
    ffmpeg -version 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw }
}
catch {
    Write-Error "FFmpeg not found! Please install FFmpeg and add it to your PATH."
    exit
}

$files = Get-ChildItem -Path $sourceDir -Filter "*.png"
$total = $files.Count
$current = 0

foreach ($file in $files) {
    $current++
    $outputFile = Join-Path -Path $destDir -ChildPath $file.Name
    
    # Calculate progress
    $percent = [math]::Round(($current / $total) * 100)
    Write-Progress -Activity "Compressing Images" -Status "Processing: $($file.Name)" -PercentComplete $percent

    # FFmpeg command:
    # -i: Input
    # -vf scale: Resize if width > $maxWidth, keeping aspect ratio. If smaller, don't resize.
    # -update 1: Needed sometimes for single image
    # -compression_level 100: Max PNG compression (slow but effective)
    
    # Constructing arguments
    # Note: 'scale=min(1080,iw):-1' resizes only if width is larger than 1080
    # -pred mixed: Improves PNG compression significantly
    # Quote paths explicitly to handle spaces - using simple invocation logic
    $cmdArgs = "-y -i `"$($file.FullName)`" -vf scale='min($maxWidth,iw)':-1 -pred mixed -compression_level 100 `"$outputFile`""
    
    $process = Start-Process -FilePath "ffmpeg" -ArgumentList $cmdArgs -NoNewWindow -PassThru -Wait
    
    if ($process.ExitCode -eq 0) {
        $origSize = [math]::Round($file.Length / 1KB, 2)
        $newSize = [math]::Round((Get-Item $outputFile).Length / 1KB, 2)
        Write-Host "[$current/$total] $($file.Name): ${origSize}KB -> ${newSize}KB" -ForegroundColor Cyan
    }
    else {
        Write-Host "Failed to process $($file.Name)" -ForegroundColor Red
    }
}

Write-Host "Compression Complete! Check the 'Compressed' folder." -ForegroundColor Green
Write-Host "If satisfied, you can move files from 'Compressed' to 'Characters'." -ForegroundColor Yellow
