import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import Transport from '@ledgerhq/hw-transport-u2f';
import AppIcx from '@ledgerhq/hw-app-icx';
import swal from '@sweetalert/with-react';
import { formatNumber } from 'utils/formatNumber';
import Alert, { ALERT_TYPE_DANGER, ALERT_TYPE_INFO } from 'components/Alert';
import Button from 'components/Button';
import { useIconService } from 'components/IconService';
import { useWallet } from 'components/Wallet';

const BASE_PATH = `44'/4801368'/0'/0'`;
const ADDRESSES_PER_PAGE = 5;

function PaginationButton({ className, disabled, isActive, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`text-sm uppercase px-3 py-2 border ${isActive ? 'font-bold' : ''} ${
        !isActive && disabled ? 'text-gray-500 cursor-default' : 'hover:shadow'
      } ${className || ''}`}
      {...props}
    />
  );
}

function UnlockWithLedger({ onUnlockWallet }) {
  const { getBalance } = useIconService();
  const { accessLedgerWallet } = useWallet();
  const [icx, setIcx] = useState(null);
  const [pages, setPages] = useState([1, 2, 3, 4, 5]);
  const [currentPage, setCurrentPage] = useState(1);
  const [wallets, setWallets] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasLedgerSupport, setHasLedgerSupport] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Setup transport and icx, attempt to connect to Ledger immediately
    setIsConnecting(true);
    Transport.create()
      .then(transport => {
        transport.setDebugMode(false);
        const icx = new AppIcx(transport);
        setIcx(icx);
        return connectToLedger(icx, true);
      })
      .catch(error => {
        setError(error);
        setHasLedgerSupport(false);
        setIsConnecting(false);
      });
  }, []); // eslint-disable-line

  async function connectToLedger(icx, suppressError = false) {
    setIsConnecting(true);
    setError(null);
    try {
      await icx.getAddress(`${BASE_PATH}/0'`, false, true);
      setIsConnected(true);
      setIsConnecting(false);

      const currentPage = 1;
      setCurrentPage(currentPage);
      loadWallets(icx, currentPage);
    } catch (error) {
      if (suppressError) console.warn('Failed connecting to Ledger.', error.message);
      else setError(error);
      setIsConnected(false);
      setIsConnecting(false);
    }
  }

  async function loadWallets(icx, page) {
    swal({
      content: (
        <Alert
          type={ALERT_TYPE_INFO}
          title="Reading addresses from Ledger"
          text={
            <>
              Make sure your Ledger device is connected and unlocked with the <b>ICON</b> app
              running. You might see multiple browser messages relating to reading a security key.
            </>
          }
        />
      ),
      buttons: false,
      closeOnClickOutside: false,
      closeOnEsc: false,
    });

    setIsLoading(true);
    const offset = (page - 1) * ADDRESSES_PER_PAGE;
    const addresses = [];
    for (let i = offset; i < offset + ADDRESSES_PER_PAGE; i++) {
      const path = `${BASE_PATH}/${i}'`;
      let { address } = await icx.getAddress(path, false, true);
      address = address.toString();
      const balance = await getBalance(address);
      addresses.push({ address, balance, path });
    }
    setWallets(addresses);
    setIsLoading(false);

    swal.close();
  }

  function onChangePage(newPage) {
    setCurrentPage(newPage);
    const firstPage = newPage > 2 ? newPage - 2 : 1;
    const pages = createPages(firstPage);
    setPages(pages);
    loadWallets(icx, newPage);
  }

  function createPages(firstPage) {
    return Array(ADDRESSES_PER_PAGE)
      .fill()
      .map((_, index) => firstPage + index);
  }

  function onSelectWallet(wallet) {
    accessLedgerWallet(wallet);
    onUnlockWallet();
  }

  return (
    <>
      {hasLedgerSupport && (isConnecting || !isConnected) && (
        <p>
          Connect your Ledger device and make sure it us unlocked with the <b>ICON</b> app running.
        </p>
      )}
      {isConnecting ? (
        <p className="mt-6">
          <FontAwesomeIcon icon={faCircleNotch} spin className="text-xl align-middle mr-2" />
          Connecting to Ledger...
        </p>
      ) : isConnected ? (
        <>
          <p>
            Connected to Ledger <b>{BASE_PATH}</b>
          </p>
          <table className="w-full mt-4">
            <thead>
              <tr className="text-gray-600 text-sm uppercase tracking-tight">
                <th className="text-left font-normal">Address</th>
                <th className="text-right font-normal">Balance</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr key="loading">
                  <td colSpan="2" rowSpan="5" className="text-center h-48">
                    <FontAwesomeIcon icon={faCircleNotch} spin className="text-3xl" />
                  </td>
                </tr>
              ) : (
                wallets.map(wallet => (
                  <tr key={wallet.address}>
                    <td className="break-all" title={wallet.address}>
                      {wallet.address.substr(0, 8)}…
                      <span className="md:hidden">{wallet.address.substr(-8)}</span>
                      <span className="hidden md:inline lg:hidden">
                        {wallet.address.substr(-16)}
                      </span>
                      <span className="hidden lg:inline">{wallet.address.substr(-24)}</span>
                    </td>
                    <td className="text-right">{formatNumber(wallet.balance, 2)} ICX</td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => onSelectWallet(wallet)}
                        title="Unlock wallet"
                        className="text-lg text-white font-bold bg-teal-500 hover:bg-teal-600 px-3 py-2 m-px rounded hover:shadow"
                      >
                        <FontAwesomeIcon icon={faUnlockAlt} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="mt-3">
            <PaginationButton
              onClick={() => onChangePage(currentPage - 1)}
              disabled={isLoading || currentPage === 1}
              className="rounded-l"
            >
              Prev
            </PaginationButton>
            {pages.map(page => (
              <PaginationButton
                key={page}
                isActive={page === currentPage}
                onClick={() => onChangePage(page)}
                disabled={isLoading}
                className="border-l-0"
              >
                {page}
              </PaginationButton>
            ))}
            <PaginationButton
              onClick={() => onChangePage(currentPage + 1)}
              disabled={isLoading}
              className="border-l-0 rounded-r"
            >
              Next
            </PaginationButton>
          </div>
        </>
      ) : (
        <>
          {hasLedgerSupport && (
            <Button type="button" onClick={() => connectToLedger(icx)} className="mt-4">
              Connect to Ledger
            </Button>
          )}
          {error && (
            <Alert
              type={ALERT_TYPE_DANGER}
              title={hasLedgerSupport ? 'Failed connecting to Ledger' : 'Browser not supported'}
              text={error.message}
              className="mt-6"
            />
          )}
        </>
      )}
    </>
  );
}

export default UnlockWithLedger;
