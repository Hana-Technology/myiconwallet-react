import React from 'react';
import PropTypes from 'prop-types';
import BaseModal from 'components/modals/Base';

function ClaimStakeVoteModal({ isOpen, onClose }) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} aria-label="Claim-Stake-Vote">
      <h3 className="text-xl uppercase tracking-tight">Claim-Stake-Vote</h3>
      <p className="mt-4">
        This feature enables you to claim your current I-Score as ICX, immediately stake the claimed
        ICX and then allocate the votes evenly to your current P-Rep delegations.
      </p>
    </BaseModal>
  );
}

ClaimStakeVoteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ClaimStakeVoteModal;
