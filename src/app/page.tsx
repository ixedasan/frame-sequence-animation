'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Heart } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const [imageCount, setImageCount] = useState(0)

  const fetchImageList = useCallback(async () => {
    try {
      const response = await fetch('/api/images')
      const data = await response.json()
      setImageCount(data.images.length)
      return data.images
    } catch (error) {
      console.error('Failed to fetch image list:', error)
      return []
    }
  }, [])

  const preloadImages = useCallback(async () => {
    const imageList = await fetchImageList()
    const loadPromises = imageList.map((src: string, index: number) => {
      return new Promise<void>((resolve, reject) => {
        const image = new Image()
        image.src = src
        image.onload = () => {
          imagesRef.current[index] = image
          resolve()
        }
        image.onerror = () => {
          console.error(`Error loading image: ${src}`)
          reject()
        }
      })
    })

    await Promise.all(loadPromises)
    setImagesLoaded(true)
  }, [fetchImageList])

  useEffect(() => {
    preloadImages()
  }, [preloadImages])

  useEffect(() => {
    if (!imagesLoaded || imageCount === 0) return

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const firstImage = imagesRef.current[0]
    canvas.width = firstImage.width
    canvas.height = firstImage.height

    context.drawImage(firstImage, 0, 0)

    gsap.from(titleRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out',
      delay: 0.5,
    })

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 1.5,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: '.scroll-container',
        start: 'top top',
        end: '10% top',
        scrub: true,
      },
    })

    const updateImage = (progress: number) => {
      const frameIndex = Math.min(
        Math.floor(progress * (imageCount - 1)),
        imageCount - 1,
      )
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(imagesRef.current[frameIndex], 0, 0)
    }

    const scrollTrigger = ScrollTrigger.create({
      trigger: '.scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: self => {
        updateImage(self.progress)
      },
    })

    return () => {
      scrollTrigger.kill()
    }
  }, [imagesLoaded, imageCount])

  return (
    <div className="relative">
      <div className="scroll-container relative h-[1600vh]">
        <div className="sticky left-0 top-0 h-screen w-full overflow-hidden">
          <canvas
            ref={canvasRef}
            className="h-full w-full object-cover"
          ></canvas>
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-1000"
          >
            <div className="flex h-full items-center justify-center">
              <h1
                ref={titleRef}
                className="text-4xl font-thin uppercase tracking-widest text-white"
              >
                Scrolling Web Image
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 transform">
        <p className="text-sm font-light tracking-wider text-white opacity-75">
          Made with <Heart className="inline-block" /> by{' '}
          <Link
            href="https://github.com/ixedasan"
            target="_blank"
            className="text-lg"
          >
            ixedasan
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Home
