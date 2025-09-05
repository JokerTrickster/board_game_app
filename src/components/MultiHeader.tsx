import React from 'react';
import GameHeader from './GameHeader';
import FindItViewModel from '../games/find-it/services/FindItViewModel';

const MultiHeader: React.FC<{ userData?: any }> = ({ userData }) => {
    return (
        <GameHeader
            type="multi"
            userData={userData}
            users={userData?.users}
            showSettings={true}
            enableBackHandler={true}
            showExitConfirmation={false}
        />
    );
};

export default MultiHeader;
