import Axios from 'axios';
import { throttleAdapterEnhancer } from 'axios-extensions';
import { AXIOS_TIMEOUT, AXIOS_THROTTLE_THRESHOLD } from 'config/constants';

const axios = Axios.create({
  timeout: AXIOS_TIMEOUT,
  retryTimes: 3,
  // cache will be enabled by default in 2 seconds
  adapter: throttleAdapterEnhancer(Axios.defaults.adapter!, {
    threshold: AXIOS_THROTTLE_THRESHOLD
  })
});

export default axios;
