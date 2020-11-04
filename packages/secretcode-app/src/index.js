import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { Button, Input, Spacer, useInput, useToasts } from '@zeit-ui/react';
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

const AppHeader = () => (
  <Container>
    <h1>Secret Code!</h1>
  </Container>
);

const AppBody = observer(() => {
  const { appRuntime, secretcodeApp } = useStore();
  const [, setToast] = useToasts();
  const { state: shw, bindings } = useInput('This is secret code!');

  async function updateCode() {
    if (!secretcodeApp) return;
    try {
      const response = await secretcodeApp.queryCode(appRuntime);
      console.log('Response::GetCode', response);

      secretcodeApp.setCode(response.GetCode.code);
    } catch (err) {
      setToast(err.message, 'error');
    }
  }

  const showCommandPayload = useMemo(() => {
    return {
      Show: {
        codestr: shw,
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
      <Spacer y={1} />

      <h3>Code</h3>
      <section>
        <div>Code: {secretcodeApp.codev}</div>
        <div>
          <Button onClick={updateCode}>Show</Button>
        </div>
      </section>
      <Spacer y={1} />

      <h3>Secret Code</h3>
      <section>
        <div>
          <Input label='By' {...bindings} />
        </div>
        <ButtonWrapper>
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
