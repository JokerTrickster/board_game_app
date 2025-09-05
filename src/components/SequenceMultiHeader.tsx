import React, { useEffect, useState } from 'react';
import GameHeader from './GameHeader';
import { sequenceViewModel } from '../games/sequence/services/SequenceViewModel';
import { sequenceWebSocketService } from '../games/sequence/services/SequenceWebsocketService';
import sequenceCards from '../assets/data/sequnce_cards.json';

const TURN_TIME = 30; // 타이머 시간 상수

// 카드 이미지 매핑 객체 (SequenceScreen에서 사용한 것과 동일하게)
const cardImageMap: { [key: string]: any } = {
'all.png': require('../assets/icons/sequence/cards/all.png'),
  'clovaa.png': require('../assets/icons/sequence/cards/clovaa.png'),
  'clova2.png': require('../assets/icons/sequence/cards/clova2.png'),
  'clova3.png': require('../assets/icons/sequence/cards/clova3.png'),
  'clova4.png': require('../assets/icons/sequence/cards/clova4.png'),
  'clova5.png': require('../assets/icons/sequence/cards/clova5.png'),
  'clova6.png': require('../assets/icons/sequence/cards/clova6.png'),
  'clova7.png': require('../assets/icons/sequence/cards/clova7.png'),
  'clova8.png': require('../assets/icons/sequence/cards/clova8.png'),
  'clova9.png': require('../assets/icons/sequence/cards/clova9.png'),
  'clova10.png': require('../assets/icons/sequence/cards/clova10.png'),
  'clovak.png': require('../assets/icons/sequence/cards/clovak.png'),
  'clovaq.png': require('../assets/icons/sequence/cards/clovaq.png'),
  'diamonda.png': require('../assets/icons/sequence/cards/diamonda.png'),
  'diamond2.png': require('../assets/icons/sequence/cards/diamond2.png'),
  'diamond3.png': require('../assets/icons/sequence/cards/diamond3.png'),
  'diamond4.png': require('../assets/icons/sequence/cards/diamond4.png'),
  'diamond5.png': require('../assets/icons/sequence/cards/diamond5.png'),
  'diamond6.png': require('../assets/icons/sequence/cards/diamond6.png'),
  'diamond7.png': require('../assets/icons/sequence/cards/diamond7.png'),
  'diamond8.png': require('../assets/icons/sequence/cards/diamond8.png'),
  'diamond9.png': require('../assets/icons/sequence/cards/diamond9.png'),
  'diamond10.png': require('../assets/icons/sequence/cards/diamond10.png'),
  'diamondk.png': require('../assets/icons/sequence/cards/diamondk.png'),
  'diamondq.png': require('../assets/icons/sequence/cards/diamondq.png'),
  'hearta.png': require('../assets/icons/sequence/cards/hearta.png'),
  'heart2.png': require('../assets/icons/sequence/cards/heart2.png'),
  'heart3.png': require('../assets/icons/sequence/cards/heart3.png'),
  'heart4.png': require('../assets/icons/sequence/cards/heart4.png'),
  'heart5.png': require('../assets/icons/sequence/cards/heart5.png'),
  'heart6.png': require('../assets/icons/sequence/cards/heart6.png'),
  'heart7.png': require('../assets/icons/sequence/cards/heart7.png'),
  'heart8.png': require('../assets/icons/sequence/cards/heart8.png'),
  'heart9.png': require('../assets/icons/sequence/cards/heart9.png'),
  'heart10.png': require('../assets/icons/sequence/cards/heart10.png'),
  'heartk.png': require('../assets/icons/sequence/cards/heartk.png'),
  'heartq.png': require('../assets/icons/sequence/cards/heartq.png'),
  'spacea.png': require('../assets/icons/sequence/cards/spacea.png'),
  'space2.png': require('../assets/icons/sequence/cards/space2.png'),
  'space3.png': require('../assets/icons/sequence/cards/space3.png'),
  'space4.png': require('../assets/icons/sequence/cards/space4.png'),
  'space5.png': require('../assets/icons/sequence/cards/space5.png'),
  'space6.png': require('../assets/icons/sequence/cards/space6.png'),
  'space7.png': require('../assets/icons/sequence/cards/space7.png'),
  'space8.png': require('../assets/icons/sequence/cards/space8.png'),
  'space9.png': require('../assets/icons/sequence/cards/space9.png'),
  'space10.png': require('../assets/icons/sequence/cards/space10.png'),
  'spacek.png': require('../assets/icons/sequence/cards/spacek.png'),
  'spaceq.png': require('../assets/icons/sequence/cards/spaceq.png'),
  'joker1.png': require('../assets/icons/sequence/cards/joker1.png'),
  'joker2.png': require('../assets/icons/sequence/cards/joker2.png'),
};

// 카드ID로 카드 정보 조회
const getCardInfoById = (cardID: number) => {
  return sequenceCards.find(card => card.id === cardID);
};

// 카드 정보로 이미지 반환
const getCardImage = (cardInfo: any) => {
  if (!cardInfo || !cardInfo.image) return null;
  return cardImageMap[cardInfo.image] || null;
};

const SequenceMultiHeader: React.FC<{ userData?: any }> = ({ userData }) => {
    const [timer, setTimer] = useState(TURN_TIME);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const [myLastCard, setMyLastCard] = useState<number | null>(null);
    const [opponentLastCard, setOpponentLastCard] = useState<number | null>(null);

    // 타이머 설정
    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setTimer(TURN_TIME);

        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    timerRef.current = null;
                    if (sequenceViewModel.isMyTurn) {
                        sequenceWebSocketService.sendTimeoutEvent();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [sequenceViewModel.isMyTurn]);

    // 마지막 사용 카드 추적
    useEffect(() => {
        // 내 마지막 사용 mapID → 카드ID
        if (sequenceViewModel.ownedMapIDs.length > 0) {
            const lastMapID = sequenceViewModel.ownedMapIDs[sequenceViewModel.ownedMapIDs.length - 1];
            const cardInfo = sequenceCards.find(card => card.mapID === lastMapID);
            setMyLastCard(cardInfo?.id ?? null);
        }
        // 상대 마지막 사용 mapID → 카드ID
        if (sequenceViewModel.opponentOwnedMapIDs.length > 0) {
            const lastMapID = sequenceViewModel.opponentOwnedMapIDs[sequenceViewModel.opponentOwnedMapIDs.length - 1];
            const cardInfo = sequenceCards.find(card => card.mapID === lastMapID);
            setOpponentLastCard(cardInfo?.id ?? null);
        }
    }, [sequenceViewModel.ownedMapIDs, sequenceViewModel.opponentOwnedMapIDs]);

    // Create a card image getter function that matches sequence's pattern
    const getSequenceCardImageSource = (cardId: number | null) => {
        if (!cardId) return null;
        const cardInfo = getCardInfoById(cardId);
        return getCardImage(cardInfo);
    };

    return (
        <GameHeader
            type="game-multi"
            userData={userData}
            users={userData?.users}
            timer={timer}
            maxTime={TURN_TIME}
            gameType="sequence"
            isMyTurn={sequenceViewModel.isMyTurn}
            myLastCard={myLastCard}
            opponentLastCard={opponentLastCard}
            showTimer={true}
            showLastCards={true}
            getCardImageSource={getSequenceCardImageSource}
            enableBackHandler={true}
            showExitConfirmation={true}
        />
    );
};

export default SequenceMultiHeader;
