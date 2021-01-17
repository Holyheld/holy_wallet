import React from 'react';
import styled from 'styled-components';
import NavigationList from '../components/navigation-list/NavigationList';
import { Sheet, SheetTitle } from '../components/sheet';
import useWallets from '../hooks/useWallets';
import { colors } from '@holyheld-com/styles';

const Whitespace = styled.View`
  background-color: ${colors.modalBackground};
  bottom: -400px;
  height: 400px;
  position: absolute;
  width: 100%;
`;

export default function HamburgerSheet() {
  const { isReadOnlyWallet } = useWallets();

  return (
    <Sheet borderRadius={30}>
      <SheetTitle />
      {android && <Whitespace />}
      <NavigationList isReadOnlyWallet={isReadOnlyWallet} showDividers />
    </Sheet>
  );
}
