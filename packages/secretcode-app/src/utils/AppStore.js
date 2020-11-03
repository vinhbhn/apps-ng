import { types, flow } from 'mobx-state-tree';

export const CONTRACT_SECRETCODE = 6;

export const createSecretCodeAppStore = (defaultValue = {}, options = {}) => {
  const SecretCodeAppStore = types
    .model('SecretCodeAppStore', {
      codev: types.maybeNull(types.string),
    })
    .actions((self) => ({
      setCode(showstr) {
        self.codev = showstr;
      },
      async queryCode(runtime) {
        return await runtime.query(CONTRACT_SECRETCODE, 'GetCode');
      },
    }));

  return SecretCodeAppStore.create(defaultValue);
};
