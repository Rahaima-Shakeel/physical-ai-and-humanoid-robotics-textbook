import React, { type ReactNode } from 'react';
import NavbarItem from '@theme-original/NavbarItem';
import type NavbarItemType from '@theme-original/NavbarItem';
import type { WrapperProps } from '@docusaurus/types';
import NavbarAuth from '@site/src/components/Auth/NavbarAuth';

type Props = WrapperProps<typeof NavbarItemType>;

export default function NavbarItemWrapper(props: Props): ReactNode {
  if (props.type === 'custom-auth') {
    return <NavbarAuth {...props} />;
  }
  return (
    <>
      <NavbarItem {...props} />
    </>
  );
}
