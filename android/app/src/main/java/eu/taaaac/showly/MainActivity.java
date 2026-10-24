package eu.taaaac.showly;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 🛡️ TAAAAC SHOWLY - FLAG_SECURE HARDWARE SCREENSHOT & RECORDING BLOCK
        // Rende lo schermo impenetrabile a screenshot fisici (Power + Volume), registrazioni
        // video dello schermo e anteprime nell'app switcher del sistema operativo.
        // Risultato: fotogramma 100% nero identico a Disney+, Netflix e app bancarie.
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
    }
}
