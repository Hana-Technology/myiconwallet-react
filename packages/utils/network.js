export const NETWORK_REF_MAINNET = 'mainnet';
export const NETWORK_REF_TESTNET = 'testnet';

export function getNetwork(networkRef) {
  switch (networkRef) {
    case NETWORK_REF_MAINNET:
      return {
        nid: 1,
        ref: NETWORK_REF_MAINNET,
        apiEndpoint: 'https://ctz.solidwallet.io/api/v3',
        trackerUrl: 'https://tracker.icon.foundation',
      };
    case NETWORK_REF_TESTNET:
    default:
      return {
        nid: 80,
        ref: NETWORK_REF_TESTNET,
        apiEndpoint: 'https://zicon.net.solidwallet.io/api/v3',
        trackerUrl: 'https://zicon.tracker.solidwallet.io',
      };
  }
}
