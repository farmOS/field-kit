import runUpgrades from './runUpgrades';

describe('runUpgrades', () => {
  let str = '';
  const config = {
    stores: [{
      name: 'logs',
      upgrades: [
        {
          version: 1,
          onUpgrade() {
            return new Promise((resolve) => {
              setTimeout(() => {
                str += this.version;
                resolve();
              }, 300);
            });
          },
        },
        {
          version: 2,
          onUpgrade() {
            str += this.version;
          },
        },
        {
          version: 3,
          onUpgrade() {
            return new Promise((resolve) => {
              setTimeout(() => {
                str += this.version;
                resolve();
              }, 100);
            });
          },
        },
        {
          version: 4,
          onUpgrade() {
            return new Promise((resolve) => {
              setTimeout(() => {
                str += this.version;
                resolve();
              }, 0);
            });
          },
        },
      ],
    }],
  };
  const run = runUpgrades(config);

  it('runs in correct order', () => run({ oldVersion: 0 })
  //   expect(promise instanceof Promise).toBe(true);
  // });
    .then(() => {
      expect(str).toBe('1234');
    }));
});
