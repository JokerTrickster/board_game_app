import React, { useEffect, useState } from 'react';
import GameHeader from './GameHeader';
import { slimeWarViewModel } from '../games/slime-war/services/SlimeWarViewModel';

const TURN_TIME = 30;

// 카드 이미지 매핑 (id: require)
const cardImageMap: { [key: number]: any } = {
    1: require('../assets/icons/slime-war/card/card01.png'),
    2: require('../assets/icons/slime-war/card/card01.png'),
    3: require('../assets/icons/slime-war/card/card02.png'),
    4: require('../assets/icons/slime-war/card/card02.png'),
    5: require('../assets/icons/slime-war/card/card03.png'),
    6: require('../assets/icons/slime-war/card/card03.png'),
    7: require('../assets/icons/slime-war/card/card11.png'),
    8: require('../assets/icons/slime-war/card/card11.png'),
    9: require('../assets/icons/slime-war/card/card12.png'),
    10: require('../assets/icons/slime-war/card/card12.png'),
    11: require('../assets/icons/slime-war/card/card13.png'),
    12: require('../assets/icons/slime-war/card/card13.png'),
    13: require('../assets/icons/slime-war/card/card21.png'),
    14: require('../assets/icons/slime-war/card/card21.png'),
    15: require('../assets/icons/slime-war/card/card22.png'),
    16: require('../assets/icons/slime-war/card/card22.png'),
    17: require('../assets/icons/slime-war/card/card23.png'),
    18: require('../assets/icons/slime-war/card/card23.png'),
    19: require('../assets/icons/slime-war/card/card31.png'),
    20: require('../assets/icons/slime-war/card/card31.png'),
    21: require('../assets/icons/slime-war/card/card32.png'),
    22: require('../assets/icons/slime-war/card/card32.png'),
    23: require('../assets/icons/slime-war/card/card33.png'),
    24: require('../assets/icons/slime-war/card/card33.png'),
    25: require('../assets/icons/slime-war/card/card41.png'),
    26: require('../assets/icons/slime-war/card/card41.png'),
    27: require('../assets/icons/slime-war/card/card42.png'),
    28: require('../assets/icons/slime-war/card/card42.png'),
    29: require('../assets/icons/slime-war/card/card43.png'),
    30: require('../assets/icons/slime-war/card/card43.png'),
    31: require('../assets/icons/slime-war/card/card51.png'),
    32: require('../assets/icons/slime-war/card/card51.png'),
    33: require('../assets/icons/slime-war/card/card52.png'),
    34: require('../assets/icons/slime-war/card/card52.png'),
    35: require('../assets/icons/slime-war/card/card53.png'),
    36: require('../assets/icons/slime-war/card/card53.png'),
    37: require('../assets/icons/slime-war/card/card61.png'),
    38: require('../assets/icons/slime-war/card/card61.png'),
    39: require('../assets/icons/slime-war/card/card62.png'),
    40: require('../assets/icons/slime-war/card/card62.png'),
    41: require('../assets/icons/slime-war/card/card63.png'),
    42: require('../assets/icons/slime-war/card/card63.png'),
    43: require('../assets/icons/slime-war/card/card71.png'),
    44: require('../assets/icons/slime-war/card/card71.png'),
    45: require('../assets/icons/slime-war/card/card72.png'),
    46: require('../assets/icons/slime-war/card/card72.png'),
    47: require('../assets/icons/slime-war/card/card73.png'),
    48: require('../assets/icons/slime-war/card/card73.png'),
};

// 카드 ID로 이미지 경로 반환
const getCardImageSource = (cardId: number) => {
    return cardImageMap[cardId] ?? null;
};

const SlimeWarMultiHeader: React.FC<{ userData?: any; timer: number }> = ({ userData, timer }) => {
    const [myLastCard, setMyLastCard] = useState<any>(null);
    const [opponentLastCard, setOpponentLastCard] = useState<any>(null);

    useEffect(() => {
        const currentMyCard = slimeWarViewModel.myLastPlacedCard;
        const currentOpponentCard = slimeWarViewModel.opponentLastPlacedCard;

        // null이 아닐 때만 카드 정보 업데이트
        if (currentMyCard !== 0) {
            setMyLastCard(currentMyCard);
        }
        if (currentOpponentCard !== 0) {
            setOpponentLastCard(currentOpponentCard);
        }
    }, []);

    return (
        <GameHeader
            type="game-multi"
            userData={userData}
            users={userData?.users}
            timer={timer}
            maxTime={TURN_TIME}
            gameType="slime-war"
            isMyTurn={slimeWarViewModel.isMyTurn}
            myLastCard={myLastCard}
            opponentLastCard={opponentLastCard}
            showTimer={true}
            showLastCards={true}
            getCardImageSource={getCardImageSource}
            enableBackHandler={true}
            showExitConfirmation={true}
        />
    );
};

export default SlimeWarMultiHeader;
