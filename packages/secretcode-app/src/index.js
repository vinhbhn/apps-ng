import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { Button, Input, useInput, useToasts } from '@zeit-ui/react';
import { Plus as PlusIcon } from '@zeit-ui/react-icons';

import { useStore } from '@/store';
import Container from '@/components/Container';
import UnlockRequired from '@/components/accounts/UnlockRequired';
import PushCommandButton from '@/components/PushCommandButton';

import {
  CONTRACT_SECRETCODE,
  createSecretCodeAppStore,
} from './utils/AppStore';
import { reaction } from 'mobx';

const ButtonWrapper = styled.div`
  margin-top: 5px;
  width: 200px;
`;

/**
 * Header of the HelloWorld app page
 */
const AppHeader = () => (
  <Container>
    <h1>Secret Code!</h1>
  </Container>
);

/**
 * Body of the HelloWorld app page
 */
const AppBody = observer(() => {
  const { appRuntime, secretcodeApp } = useStore();
  const [, setToast] = useToasts();
  const { state: shw, bindings } = useInput('vgk');

  /**
   * Updates the counter by querying the helloworld contract
   * The type definitions of `GetCount` request and response can be found at contract/helloworld.rs
   */
  async function updateCode() {
    if (!secretcodeApp) return;
    try {
      const response = await secretcodeApp.queryCode(appRuntime);
      // Print the response in the original to the console
      console.log('Response::GetCode', response);

      secretcodeApp.setCode(response.GetCode.code);
    } catch (err) {
      setToast(err.message, 'error');
    }
  }

  /**
   * The `increment` transaction payload object
   * It follows the command type definition of the contract (at contract/helloworld.rs)
   */
  // const incrementCommandPayload = useMemo(() => {
  //   const num = parseInt(inc)
  //   if (isNaN(num) || inc <= 0) {
  //     return undefined
  //   } else {
  //     return {
  //       Increment: {
  //         value: num
  //       }
  //     }
  //   }
  // }, [inc])

  const showCommandPayload = useMemo(() => {
    const showstr = shw;
    return {
      Show: {
        codestr: showstr,
      },
    };
  }, [shw]);

  return (
    <Container>
      <section>
        <div>PRuntime: {appRuntime ? 'yes' : 'no'}</div>
        <div>PRuntime ping: {appRuntime.latency || '+∞'}</div>
        <div>PRuntime connected: {appRuntime?.channelReady ? 'yes' : 'no'}</div>
      </section>
      {/* <Spacer y={1} /> */}

      <h3>Code</h3>
      <section>
        <div>Code: {secretcodeApp.codev}</div>
        <div>
          <Button onClick={updateCode}>Update</Button>
        </div>
      </section>
      {/* <Spacer y={1} /> */}

      <h3>Secret Code</h3>
      <section>
        <div>
          <Input label='By' {...bindings} />
        </div>
        <ButtonWrapper>
          {/**
           * PushCommandButton is the easy way to send confidential contract txs.
           * Below it's configurated to send SecretCode::Show()
           */}
          <PushCommandButton
            // tx arguments
            contractId={CONTRACT_SECRETCODE}
            payload={showCommandPayload}
            // display messages
            modalTitle='SecretCode.Show()'
            modalSubtitle={`Show the code by ${shw}`}
            onSuccessMsg='Tx succeeded'
            // button appearance
            buttonType='secondaryLight'
            icon={PlusIcon}
            name='Send'
          />
        </ButtonWrapper>
      </section>
    </Container>
  );
});

/**
 * Injects the mobx store to the global state once initialized
 */
const StoreInjector = observer(({ children }) => {
  const appStore = useStore();
  const [shouldRenderContent, setShouldRenderContent] = useState(false);

  useEffect(() => {
    if (!appStore || !appStore.appRuntime) return;
    if (typeof appStore.secretcodeApp !== 'undefined') return;
    appStore.secretcodeApp = createSecretCodeAppStore({});
  }, [appStore]);

  useEffect(() =>
    reaction(
      () => appStore.secretcodeApp,
      () => {
        if (appStore.secretcodeApp && !shouldRenderContent) {
          setShouldRenderContent(true);
        }
      },
      { fireImmediately: true }
    )
  );

  return shouldRenderContent && children;
});

export default () => (
  <UnlockRequired>
    <StoreInjector>
      <AppHeader />
      <AppBody />
    </StoreInjector>
  </UnlockRequired>
);
