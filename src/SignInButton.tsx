import './config/fclConfig';
import * as fcl from '@onflow/fcl';

function SignInButton() {


    return (
        <button onClick={async () => {
            await fcl.authenticate()
            console.log(fcl.currentUser())
        }}>Sign in</button>
    );
}

export default SignInButton;