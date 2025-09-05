import React from 'react';
import GameHeader from './GameHeader';

const Header: React.FC<{ userData?: any }> = ({ userData }) => {
    return (
        <GameHeader
            type="home"
            userData={userData}
            showCoin={true}
            showSettings={true}
        />
    );
};

export default Header;
