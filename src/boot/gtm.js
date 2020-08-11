/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import GTM from '../compositions/gtm';

export default ({ router }) => {
  router.afterEach(to => {
    GTM.logPage(to.path);
  });
};
