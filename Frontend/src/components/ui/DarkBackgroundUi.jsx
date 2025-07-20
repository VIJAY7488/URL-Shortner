import { useEffect, useState } from "react"

export default function DarkBackgroundUi() {
  const [shapes, setShapes] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const colors = [
      "rgba(147, 51, 234, 0.15)", // purple
      "rgba(219, 39, 119, 0.15)", // pink
      "rgba(59, 130, 246, 0.15)", // blue
      "rgba(16, 185, 129, 0.15)", // emerald
      "rgba(245, 158, 11, 0.15)", // amber
    ]

    const shapeTypes = ["circle", "square", "triangle"]

    const initialShapes = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 80 + 30,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      opacity: Math.random() * 0.4 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
    }))

    setShapes(initialShapes)

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    const animateShapes = () => {
      setShapes((prevShapes) =>
        prevShapes.map((shape) => ({
          ...shape,
          rotation: shape.rotation + shape.rotationSpeed,
        })),
      )
    }

    const interval = setInterval(animateShapes, 16) // ~60fps

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(interval)
    }
  }, [])

  const renderShape = (shape) => {
    const style = {
      position: "absolute",
      left: shape.x - shape.size / 2,
      top: shape.y - shape.size / 2,
      width: shape.size,
      height: shape.size,
      opacity: shape.opacity,
      transform: `rotate(${shape.rotation}deg)`,
      transition: "all 0.1s ease-out",
      pointerEvents: "none",
    }

    switch (shape.shape) {
      case "circle":
        return (
          <div
            key={shape.id}
            style={{
              ...style,
              backgroundColor: shape.color,
              borderRadius: "50%",
              border: `2px solid ${shape.color.replace("0.15", "0.4")}`,
              boxShadow: `0 0 20px ${shape.color}`,
            }}
          />
        )
      case "square":
        return (
          <div
            key={shape.id}
            style={{
              ...style,
              backgroundColor: shape.color,
              border: `2px solid ${shape.color.replace("0.15", "0.4")}`,
              borderRadius: "8px",
              boxShadow: `0 0 20px ${shape.color}`,
            }}
          />
        )
      case "triangle":
        return (
          <div
            key={shape.id}
            style={{
              ...style,
              width: 0,
              height: 0,
              backgroundColor: "transparent",
              borderLeft: `${shape.size / 2}px solid transparent`,
              borderRight: `${shape.size / 2}px solid transparent`,
              borderBottom: `${shape.size}px solid ${shape.color}`,
              filter: `drop-shadow(0 0 10px ${shape.color})`,
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      {/* Base dark background with gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -z-20" />

      {/* Animated gradient overlay */}
      <div
        className="fixed inset-0 opacity-30 -z-10 transition-all duration-500"
        style={{
          background: `
            radial-gradient(circle at ${(mousePosition.x / window.innerWidth) * 100}% ${(mousePosition.y / window.innerHeight) * 100}%, 
              rgba(168, 85, 247, 0.3) 0%, 
              rgba(236, 72, 153, 0.2) 25%, 
              rgba(59, 130, 246, 0.1) 50%, 
              transparent 70%)
          `,
        }}
      />

      {/* Static shapes with rotation only */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">{shapes.map(renderShape)}</div>

      {/* Subtle grid pattern */}
      <div
        className="fixed inset-0 opacity-10 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </>
  )
}
