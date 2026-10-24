import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var blackoutOverlayView: UIView?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // 🛡️ TAAAAC SHOWLY - iOS ANTI-RECORDING & SECURE SHIELD
        // Monitora l'avvio della registrazione dello schermo o AirPlay Mirroring (Disney+ style)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleScreenCaptureChange),
            name: UIScreen.capturedDidChangeNotification,
            object: nil
        )
        return true
    }

    @objc private func handleScreenCaptureChange() {
        DispatchQueue.main.async { [weak self] in
            if UIScreen.main.isCaptured {
                // Registrazione schermo attiva: applica oscuramento totale nero
                self?.applyBlackout()
            } else {
                // Registrazione terminata: ripristina la visualizzazione
                self?.removeBlackout()
            }
        }
    }

    private func applyBlackout() {
        guard let window = self.window, blackoutOverlayView == nil else { return }
        let overlay = UIView(frame: window.bounds)
        overlay.backgroundColor = .black
        overlay.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        
        let label = UILabel()
        label.text = "🛡️ Contenuto Protetto da Registrazione"
        label.textColor = UIColor(red: 212/255, green: 175/255, blue: 55/255, alpha: 0.9)
        label.font = UIFont.systemFont(ofSize: 14, weight: .semibold)
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        overlay.addSubview(label)
        
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: overlay.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: overlay.centerYAnchor)
        ])
        
        window.addSubview(overlay)
        self.blackoutOverlayView = overlay
    }

    private func removeBlackout() {
        blackoutOverlayView?.removeFromSuperview()
        blackoutOverlayView = nil
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Oscura lo schermo prima che iOS scatti l'istantanea per l'App Switcher
        applyBlackout()
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Rimuove l'oscuramento quando l'utente torna nell'app (a meno che non sia attiva una registrazione)
        if !UIScreen.main.isCaptured {
            removeBlackout()
        }
    }

    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}
