import MUSkeleton, { SkeletonProps } from '@material-ui/lab/Skeleton'

export default function Skeleton(props: SkeletonProps) {
  return (
    <MUSkeleton
      animation='wave'
      classes={{
        wave: 'th-wave'
      }}
      {...props}
    >
      <style jsx global>{`
        .th-wave::after {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          ) !important;
        }
      `}</style>
    </MUSkeleton>
  )
}
