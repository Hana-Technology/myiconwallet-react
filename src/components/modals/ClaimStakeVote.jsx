import React from 'react';
import PropTypes from 'prop-types';
import BaseModal from 'components/modals/Base';

function ClaimStakeVoteModal({ isOpen, onClose }) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} aria-label="Claim-Stake-Vote">
      <h3>Claim-Stake-Vote</h3>
      <p>This is claim stake vote!</p>
    </BaseModal>
  );
}

ClaimStakeVoteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ClaimStakeVoteModal;
