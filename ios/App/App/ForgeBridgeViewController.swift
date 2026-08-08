import UIKit
import Capacitor
import WebKit
import WidgetKit

private final class ForgeWidgetBridge: NSObject, WKScriptMessageHandler {
    private let group = "group.com.forgelearning.app"

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "forgeWidgetSync",
              let payload = message.body as? [String: Any] else { return }

        let defaults = UserDefaults(suiteName: group)
        var didUpdate = false

        if let classes = payload["classes"] as? [[String: String]], !classes.isEmpty {
            defaults?.set(classes, forKey: "forge-widget-classes")
            didUpdate = true
        }

        if let widgetData = payload["widgetData"] as? [String: Any],
           JSONSerialization.isValidJSONObject(widgetData),
           let data = try? JSONSerialization.data(withJSONObject: widgetData) {
            defaults?.set(data, forKey: "forge-widget-data")
            didUpdate = true
        }

        if let teacherData = payload["teacherData"] as? [String: Any],
           JSONSerialization.isValidJSONObject(teacherData),
           let data = try? JSONSerialization.data(withJSONObject: teacherData) {
            defaults?.set(data, forKey: "forge-widget-teacher-data")
            didUpdate = true
        }

        if didUpdate {
            WidgetCenter.shared.reloadAllTimelines()
        }
    }
}

final class ForgeBridgeViewController: CAPBridgeViewController {
    private var widgetBridge: ForgeWidgetBridge?

    override var preferredStatusBarStyle: UIStatusBarStyle {
        traitCollection.userInterfaceStyle == .dark ? .lightContent : .darkContent
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = ForgeNativeSurface.background(for: traitCollection)
        let bridge = ForgeWidgetBridge()
        widgetBridge = bridge
        if let contentController = webView?.configuration.userContentController {
            contentController.removeScriptMessageHandler(forName: "forgeWidgetSync")
            contentController.add(bridge, name: "forgeWidgetSync")
        }
    }

    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        guard previousTraitCollection?.userInterfaceStyle != traitCollection.userInterfaceStyle else { return }
        view.backgroundColor = ForgeNativeSurface.background(for: traitCollection)
        setNeedsStatusBarAppearanceUpdate()
    }
}

enum ForgeNativeSurface {
    static func background(for traits: UITraitCollection) -> UIColor {
        traits.userInterfaceStyle == .dark
            ? UIColor(red: 0.078, green: 0.071, blue: 0.063, alpha: 1)
            : UIColor(red: 0.965, green: 0.933, blue: 0.910, alpha: 1)
    }
}
