$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$taskSource = Join-Path $taskRoot 'assets/source-illustrations/comic-units-8-10.png'
$taskOutput = Join-Path $taskRoot 'dist/assets/illustrations'
$taskBitmap = [Drawing.Bitmap]::new($taskSource)
try {
    $taskEncoder = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
    $taskParameters = [Drawing.Imaging.EncoderParameters]::new(1)
    $taskParameters.Param[0] = [Drawing.Imaging.EncoderParameter]::new([Drawing.Imaging.Encoder]::Quality, [long]90)
    for ($taskIndex = 0; $taskIndex -lt 6; $taskIndex++) {
        $taskColumn = $taskIndex % 3
        $taskRow = [Math]::Floor($taskIndex / 3)
        $taskLeft = [int][Math]::Round($taskColumn * $taskBitmap.Width / 3)
        $taskTop = [int][Math]::Round($taskRow * $taskBitmap.Height / 2)
        $taskRight = [int][Math]::Round(($taskColumn + 1) * $taskBitmap.Width / 3)
        $taskBottom = [int][Math]::Round(($taskRow + 1) * $taskBitmap.Height / 2)
        $taskCanvas = [Drawing.Bitmap]::new(627, 627)
        $taskGraphics = [Drawing.Graphics]::FromImage($taskCanvas)
        try {
            $taskGraphics.Clear([Drawing.Color]::White)
            $taskGraphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            # A four-pixel white-gutter inset removes tiny marks at cell seams.
            $taskGraphics.DrawImage($taskBitmap, [Drawing.Rectangle]::new(0,0,627,627), [Drawing.Rectangle]::new($taskLeft+4,$taskTop+4,$taskRight-$taskLeft-8,$taskBottom-$taskTop-8), [Drawing.GraphicsUnit]::Pixel)
            $taskNumber = (16 + $taskIndex).ToString('00')
            $taskCanvas.Save((Join-Path $taskOutput "story-$taskNumber.jpg"), $taskEncoder, $taskParameters)
        }
        finally { $taskGraphics.Dispose(); $taskCanvas.Dispose() }
    }
    $taskParameters.Dispose()
}
finally { $taskBitmap.Dispose() }
Write-Output 'Saved six original story illustrations, 16-21.'
