$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$taskSource = Join-Path $taskRoot 'assets/source-illustrations/guide-progressive-sheet.png'
$taskOutput = Join-Path $taskRoot 'dist/assets/illustrations'
$taskNames = @('guide-conversation-inside', 'guide-conversation-whole', 'guide-painting-inside', 'guide-painting-whole')
# The generator gave the three-vignette cells extra width. Use the observed
# white gutters rather than a mathematical midpoint that would cut a figure.
$taskRegions = @(
    @(10,50,565,545), @(580,165,720,355),
    @(0,635,570,515), @(565,720,745,350)
)
$taskBitmap = [Drawing.Bitmap]::new($taskSource)
try {
    $taskEncoder = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
    $taskParameters = [Drawing.Imaging.EncoderParameters]::new(1)
    $taskParameters.Param[0] = [Drawing.Imaging.EncoderParameter]::new([Drawing.Imaging.Encoder]::Quality, [long]90)
    for ($taskIndex = 0; $taskIndex -lt 4; $taskIndex++) {
        $taskRegion = $taskRegions[$taskIndex]
        $taskLeft, $taskTop, $taskWidth, $taskHeight = $taskRegion
        $taskDrawWidth = 627
        $taskDrawHeight = [int][Math]::Round(627.0 * $taskHeight / $taskWidth)
        $taskCanvas = [Drawing.Bitmap]::new($taskDrawWidth, $taskDrawHeight)
        $taskGraphics = [Drawing.Graphics]::FromImage($taskCanvas)
        try {
            $taskGraphics.Clear([Drawing.Color]::White)
            $taskGraphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            # Preserve each crop's proportions, including the wide sequences.
            $taskTarget = [Drawing.Rectangle]::new(0, 0, $taskDrawWidth, $taskDrawHeight)
            $taskCrop = [Drawing.Rectangle]::new($taskLeft, $taskTop, $taskWidth, $taskHeight)
            $taskGraphics.DrawImage($taskBitmap, $taskTarget, $taskCrop, [Drawing.GraphicsUnit]::Pixel)
            $taskCanvas.Save((Join-Path $taskOutput ($taskNames[$taskIndex] + '.jpg')), $taskEncoder, $taskParameters)
        }
        finally { $taskGraphics.Dispose(); $taskCanvas.Dispose() }
    }
    $taskParameters.Dispose()
}
finally { $taskBitmap.Dispose() }
Write-Output 'Saved four progressive comparison illustrations, preserving proportions.'
