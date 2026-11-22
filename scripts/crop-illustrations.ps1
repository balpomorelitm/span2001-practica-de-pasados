param([switch]$IncludeFinal)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$jpegEncoder = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$jpegParameters = [Drawing.Imaging.EncoderParameters]::new(1)
$jpegParameters.Param[0] = [Drawing.Imaging.EncoderParameter]::new([Drawing.Imaging.Encoder]::Quality,[long]90)
$projectRoot = Split-Path -Parent $PSScriptRoot
$sheets = @(
 @{ Id='comic-sheet-a'; Names=@('course-study','story-01','story-02','story-03') },
 @{ Id='comic-sheet-b'; Names=@('story-04','story-05','story-06','story-07') },
 @{ Id='comic-sheet-c'; Names=@('story-08','story-09','story-10','story-11') },
 @{ Id='comic-sheet-d'; Names=@('story-12','story-13','story-14','story-15') },
 @{ Id='comic-guide-scenes'; Inset=70; Names=@('guide-rain-inside','guide-rain-whole','guide-reading-background','guide-phone-event') }
)
foreach ($sheet in $sheets) {
 $sheetPath = Join-Path $projectRoot ('assets/source-illustrations/'+$sheet.Id+'.png')
 $bitmap = [Drawing.Bitmap]::new($sheetPath)
 try {
  $halfWidth=[int]($bitmap.Width/2); $halfHeight=[int]($bitmap.Height/2)
  for($quadrant=0; $quadrant -lt 4; $quadrant++) {
   $left=($quadrant % 2)*$halfWidth; $top=[Math]::Floor($quadrant/2)*$halfHeight
   $inset = if ($sheet.Inset) { [int]$sheet.Inset } else { 0 }
   $rect=[Drawing.Rectangle]::new(($left+$inset),($top+$inset),($halfWidth-2*$inset),($halfHeight-2*$inset))
   $tile=$bitmap.Clone($rect,[Drawing.Imaging.PixelFormat]::Format24bppRgb)
   try { $tile.Save((Join-Path $projectRoot ('dist/assets/illustrations/'+$sheet.Names[$quadrant]+'.jpg')),$jpegEncoder,$jpegParameters) } finally { $tile.Dispose() }
  }
  Write-Output ($sheet.Id+': '+$bitmap.Width+' x '+$bitmap.Height+' -> four crops')
 } finally { $bitmap.Dispose() }
}
foreach ($mode in @('inside','whole')) {
 $bitmap=[Drawing.Bitmap]::new((Join-Path $projectRoot ('assets/source-illustrations/comic-guide-work-'+$mode+'.png')))
 try { $bitmap.Save((Join-Path $projectRoot ('dist/assets/illustrations/guide-work-'+$mode+'.jpg')),$jpegEncoder,$jpegParameters) } finally { $bitmap.Dispose() }
}
