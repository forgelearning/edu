import UIKit

final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        window = windowScene.windows.first
        window?.backgroundColor = ForgeNativeSurface.background(for: windowScene.traitCollection)
    }

    func windowScene(_ windowScene: UIWindowScene, didUpdate previousTraitCollection: UITraitCollection) {
        window?.backgroundColor = ForgeNativeSurface.background(for: windowScene.traitCollection)
    }
}
