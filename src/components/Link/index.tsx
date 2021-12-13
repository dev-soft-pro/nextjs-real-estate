import NextLink from 'next/link'
import { useRouter } from 'next/router'
import cn from 'classnames'
import { UrlObject } from 'url'

interface LinkProps {
  href: string | UrlObject
  as?: string | UrlObject | undefined
  [eleName: string]: any
}

interface NavLinkProps extends LinkProps {
  activeClassName: string
}

export default function Link({ href, as, ...props }: LinkProps) {
  return (
    <NextLink href={href} as={as}>
      <a {...props} />
    </NextLink>
  )
}

export function NavLink({
  activeClassName,
  className,
  href,
  ...props
}: NavLinkProps) {
  const router = useRouter()
  return (
    <Link
      {...props}
      href={href}
      className={cn(className, {
        [activeClassName]: router.asPath.startsWith(href as string)
      })}
    />
  )
}
