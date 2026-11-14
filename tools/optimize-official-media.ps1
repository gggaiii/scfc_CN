$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assetRoot = Join-Path $PSScriptRoot '../assets/official'
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
foreach ($file in Get-ChildItem -LiteralPath $assetRoot -Recurse -File -Filter '*.jpg') {
  $source = [System.Drawing.Image]::FromFile($file.FullName)
  $limit = if ($file.Directory.Name -eq 'squad') { 900 } else { 1400 }
  $scale = [Math]::Min(1.0, $limit / [Math]::Max($source.Width, $source.Height))
  $bitmap = New-Object System.Drawing.Bitmap ([int]($source.Width * $scale)), ([int]($source.Height * $scale))
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.DrawImage($source, 0, 0, $bitmap.Width, $bitmap.Height)
  $parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
  $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]85)
  $stream = New-Object System.IO.MemoryStream
  $bitmap.Save($stream, $encoder, $parameters)
  $source.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
  [System.IO.File]::WriteAllBytes($file.FullName, $stream.ToArray())
  $stream.Dispose()
  $parameters.Dispose()
}
Write-Output 'Optimized all official JPG portraits and news photos.'
