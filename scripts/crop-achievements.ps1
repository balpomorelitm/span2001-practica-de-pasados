$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
if (!('BadgeBounds' -as [type])) {
 Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
public static class BadgeBounds {
 static List<int[]> Runs(int[] counts) {
  var bands=new List<int[]>(); int start=-1,last=-1;
  for(int i=0;i<counts.Length;i++) if(counts[i]>3) {
   if(start<0)start=i; else if(i-last>5){bands.Add(new[]{start,last});start=i;}
   last=i;
  }
  if(start>=0)bands.Add(new[]{start,last}); return bands;
 }
 public static Rectangle[] Find(Bitmap image) {
  var rows=new int[image.Height];
  for(int y=0;y<image.Height;y++)for(int x=0;x<image.Width;x++)if(image.GetPixel(x,y).A>32)rows[y]++;
  var rowBands=Runs(rows); if(rowBands.Count!=4)throw new Exception("Expected four badge rows, found "+rowBands.Count);
  var boxes=new List<Rectangle>();
  foreach(var row in rowBands){
   var cols=new int[image.Width];
   for(int x=0;x<image.Width;x++)for(int y=row[0];y<=row[1];y++)if(image.GetPixel(x,y).A>32)cols[x]++;
   var colBands=Runs(cols); if(colBands.Count!=5)throw new Exception("Expected five badges per row, found "+colBands.Count);
   foreach(var col in colBands)boxes.Add(new Rectangle(Math.Max(0,col[0]-4),Math.Max(0,row[0]-4),Math.Min(image.Width-col[0]+4,col[1]-col[0]+9),Math.Min(image.Height-row[0]+4,row[1]-row[0]+9)));
  }
  return boxes.ToArray();
 }
}
'@
}
$projectRoot=Split-Path -Parent $PSScriptRoot
$sourcePath=Join-Path $projectRoot 'assets/source-illustrations/achievement-sheet.png'
$targetDirectory=Join-Path $projectRoot 'dist/assets/achievements'
New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
$sheet=[Drawing.Bitmap]::new($sourcePath)
try {
 $boxes=[BadgeBounds]::Find($sheet)
 for($i=0;$i -lt $boxes.Count;$i++) {
  $box=$boxes[$i]
  $badge=[Drawing.Bitmap]::new(336,336,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics=[Drawing.Graphics]::FromImage($badge)
  try {
   $graphics.Clear([Drawing.Color]::Transparent)
   $destination=[Drawing.Rectangle]::new([int]((336-$box.Width)/2),[int]((336-$box.Height)/2),$box.Width,$box.Height)
   $graphics.DrawImage($sheet,$destination,$box,[Drawing.GraphicsUnit]::Pixel)
   $badge.Save((Join-Path $targetDirectory ('badge'+($i+1).ToString('00')+'.png')),[Drawing.Imaging.ImageFormat]::Png)
  } finally {$graphics.Dispose();$badge.Dispose()}
 }
 Write-Output ('Saved '+$boxes.Count+' transparent badge PNGs from one generated sheet.')
} finally {$sheet.Dispose()}
