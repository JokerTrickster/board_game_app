import React from 'react';
import GameHeader from './GameHeader';
import { frogViewModel } from '../games/frog/services/FrogViewModel';

const FrogMultiHeader: React.FC<{ userData?: any }> = ({ userData }) => {
    return (
        <GameHeader
            type="game-multi"
            userData={userData}
            users={userData?.users}
            gameType="frog"
            isMyTurn={frogViewModel.isMyTurn}
            showSettings={true}
            enableBackHandler={true}
            showExitConfirmation={true}
        />
    );
};

export default FrogMultiHeader;