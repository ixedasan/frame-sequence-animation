import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  const framesDirectory = path.join(process.cwd(), 'public', 'frames')

  try {
    const fileNames = fs.readdirSync(framesDirectory)
    const images = fileNames
      .filter(fileName => /\.(png|jpe?g|gif)$/i.test(fileName))
      .map(fileName => `/frames/${fileName}`)

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error reading frames directory:', error)
    return NextResponse.json(
      { error: 'Unable to read frames directory' },
      { status: 500 },
    )
  }
}
