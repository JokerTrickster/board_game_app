import React from 'react';
import GameHeader from './GameHeader';
import SoloFindItViewModel from '../games/find-it/services/SoloFindItViewModel';

interface SoloHeaderProps {
    userData?: any;
    showRound?: boolean; // 게임 화면에서는 true, 결과 화면에서는 false로 전달
}

const SoloHeader: React.FC<SoloHeaderProps> = ({ userData, showRound = true }) => {
    return (
        <GameHeader
            type="solo"
            userData={userData}
            showSettings={true}
            enableBackHandler={true}
            showExitConfirmation={true}
        />
    );
};

export default SoloHeader;
