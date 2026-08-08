import SwiftUI
import WidgetKit
import AppIntents
import UIKit

private let forgeWidgetGroup = "group.com.forgelearning.app"

struct ForgeWidgetEntry: TimelineEntry {
    let date: Date
    let role: ForgeWidgetRole
    let title: String
    let detail: String
    let progress: Int
    let secondary: String
    let deepLink: URL
    let openSignals: Int
    let students: Int
    let responses: Int

    // Keep the initializer explicit so older Swift toolchains used by the
    // beta Xcode project accept the teacher widget's extended metrics.
    init(date: Date, role: ForgeWidgetRole, title: String, detail: String,
         progress: Int, secondary: String, deepLink: URL,
         openSignals: Int = 28, students: Int = 12, responses: Int = 233) {
        self.date = date
        self.role = role
        self.title = title
        self.detail = detail
        self.progress = progress
        self.secondary = secondary
        self.deepLink = deepLink
        self.openSignals = openSignals
        self.students = students
        self.responses = responses
    }
}

enum ForgeWidgetRole: String, Codable {
    case student
    case teacher
}

struct ForgeWidgetData: Codable {
    var role: ForgeWidgetRole = .student
    var title = "AD"
    var detail = "Due soon · 0 of 8 questions answered"
    var progress = 0
    var secondary = "1 new assignment"
    var deepLink = "forge://assigned"
}

struct ForgeTeacherWidgetData: Codable {
    var classId = ""
    var className = ""
    var accuracy = 75
    var openSignals = 28
    var students = 12
    var responses = 233
    var secondary = "Open priority signals"

    private enum CodingKeys: String, CodingKey {
        case classId, className, accuracy, openSignals, students, responses, secondary
    }

    init() {}

    init(from decoder: Decoder) throws {
        let values = try decoder.container(keyedBy: CodingKeys.self)
        classId = try values.decodeIfPresent(String.self, forKey: .classId) ?? ""
        className = try values.decodeIfPresent(String.self, forKey: .className) ?? ""
        accuracy = try values.decodeIfPresent(Int.self, forKey: .accuracy) ?? 75
        openSignals = try values.decodeIfPresent(Int.self, forKey: .openSignals) ?? 28
        students = try values.decodeIfPresent(Int.self, forKey: .students) ?? 12
        responses = try values.decodeIfPresent(Int.self, forKey: .responses) ?? 233
        secondary = try values.decodeIfPresent(String.self, forKey: .secondary) ?? "Open priority signals"
    }
}

struct ForgeRefreshWidgetIntent: AppIntent {
    static var title: LocalizedStringResource = "Refresh Forge"
    static var description = IntentDescription("Refresh this Forge widget with the latest progress.")

    func perform() async throws -> some IntentResult {
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

struct ForgeWidgetProvider: TimelineProvider {
    let defaultRole: ForgeWidgetRole

    init(defaultRole: ForgeWidgetRole = .student) {
        self.defaultRole = defaultRole
    }

    func placeholder(in context: Context) -> ForgeWidgetEntry {
        return ForgeWidgetEntry(
            date: .now,
            role: defaultRole,
            title: defaultRole == .teacher ? "12A/Ec" : "AD",
            detail: defaultRole == .teacher ? "75% class accuracy · 28 open signals" : "Due soon · 0 of 8 questions answered",
            progress: defaultRole == .teacher ? 75 : 0,
            secondary: defaultRole == .teacher ? "Open priority signals" : "1 new assignment",
            deepLink: URL(string: "forge://assigned")!
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (ForgeWidgetEntry) -> Void) {
        completion(entry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ForgeWidgetEntry>) -> Void) {
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: .now) ?? .now.addingTimeInterval(1800)
        completion(Timeline(entries: [entry()], policy: .after(next)))
    }

    private func entry() -> ForgeWidgetEntry {
        let data: ForgeWidgetData
        if let raw = UserDefaults(suiteName: forgeWidgetGroup)?.data(forKey: "forge-widget-data"),
           let decoded = try? JSONDecoder().decode(ForgeWidgetData.self, from: raw),
           decoded.role == defaultRole {
            data = decoded
        } else {
            var fallback = ForgeWidgetData()
            fallback.role = defaultRole
            if defaultRole == .teacher {
                fallback.title = "12A/Ec"
                fallback.detail = "75% class accuracy · 28 open signals"
                fallback.progress = 75
                fallback.secondary = "Open priority signals"
                fallback.deepLink = "forge://teacher-class"
            }
            data = fallback
        }

        return ForgeWidgetEntry(
            date: .now,
            role: data.role,
            title: data.title,
            detail: data.detail,
            progress: min(max(data.progress, 0), 100),
            secondary: data.secondary,
            deepLink: URL(string: data.deepLink) ?? URL(string: "forge://assigned")!
        )
    }
}

struct ForgeBadge: View {
    var body: some View {
        ZStack {
            Path { path in
                path.move(to: CGPoint(x: 25, y: 4))
                path.addLine(to: CGPoint(x: 45, y: 11))
                path.addLine(to: CGPoint(x: 45, y: 26))
                path.addCurve(to: CGPoint(x: 25, y: 46), control1: CGPoint(x: 45, y: 38), control2: CGPoint(x: 34, y: 43))
                path.addCurve(to: CGPoint(x: 5, y: 26), control1: CGPoint(x: 16, y: 43), control2: CGPoint(x: 5, y: 38))
                path.addLine(to: CGPoint(x: 5, y: 11))
                path.closeSubpath()
            }
            .fill(Color.forgeNavy)

            Text("F")
                .font(.system(size: 25, weight: .black, design: .rounded))
                .foregroundStyle(Color.forgeBadgeMark)
                .offset(y: -1)
        }
        .frame(width: 50, height: 50)
    }
}

struct ForgeWidgetBackground: View {
    var body: some View {
        ZStack {
            Color.forgeCoal
            RadialGradient(
                colors: [Color.forgeOrange.opacity(0.28), .clear],
                center: .topLeading,
                startRadius: 2,
                endRadius: 190
            )
            .blendMode(.screen)
        }
    }
}

struct ForgeWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: ForgeWidgetEntry

    var body: some View {
        ZStack(alignment: .topTrailing) {
            Link(destination: entry.deepLink) {
                ZStack {
                    if family == .systemSmall {
                        small
                    } else if family == .systemLarge {
                        large
                    } else {
                        medium
                    }
                }
            }

            Button(intent: ForgeRefreshWidgetIntent()) {
                Image(systemName: "arrow.clockwise")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(Color.forgeDim)
                    .frame(width: 27, height: 27)
                    .background(.ultraThinMaterial, in: Circle())
                    .overlay(Circle().stroke(Color.forgeLine.opacity(0.7), lineWidth: 0.7))
            }
            .buttonStyle(.plain)
            .padding(9)
        }
        .containerBackground(for: .widget) {
            ForgeWidgetBackground()
        }
    }

    private var small: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                ForgeBadge()
                    .scaleEffect(0.52, anchor: .topLeading)
                    .frame(width: 26, height: 26)
                Spacer()
            }
            Spacer(minLength: 2)
            Text("NEXT MOVE")
                .font(.system(size: 9, weight: .medium, design: .monospaced))
                .tracking(1.5)
                .foregroundStyle(Color.forgeYellow)
            Text(entry.title)
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundStyle(Color.forgeCream)
                .lineLimit(1)
            Text("\(entry.progress)% complete")
                .font(.system(size: 11, weight: .medium, design: .monospaced))
                .foregroundStyle(Color.forgeSlate)
        }
        .padding(14)
    }

    private var medium: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                ForgeBadge()
                    .scaleEffect(0.58, anchor: .topLeading)
                    .frame(width: 29, height: 29)
                Text(entry.role == .teacher ? "CLASS PULSE" : "ASSIGNED QUEUE")
                    .font(.system(size: 10, weight: .medium, design: .monospaced))
                    .tracking(1.8)
                    .foregroundStyle(Color.forgeYellow)
                Spacer()
            }
            HStack(alignment: .lastTextBaseline) {
                Text(entry.title)
                    .font(.system(size: 27, weight: .bold, design: .rounded))
                    .foregroundStyle(Color.forgeCream)
                Spacer()
                Text("\(entry.progress)%")
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundStyle(Color.forgeHot)
            }
            Text(entry.detail)
                .font(.system(size: 13, weight: .medium, design: .rounded))
                .foregroundStyle(Color.forgeSlate)
                .lineLimit(1)
            GeometryReader { proxy in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.forgeLine)
                    Capsule()
                        .fill(Color.forgeOrange)
                        .frame(width: proxy.size.width * CGFloat(entry.progress) / 100)
                }
            }
            .frame(height: 6)
            Text(entry.secondary)
                .font(.system(size: 11, weight: .medium, design: .monospaced))
                .foregroundStyle(Color.forgeDim)
        }
        .padding(16)
    }

    private var large: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(spacing: 10) {
                ForgeBadge()
                    .scaleEffect(0.7, anchor: .topLeading)
                    .frame(width: 35, height: 35)
                Text(entry.role == .teacher ? "CLASS PULSE" : "LEARNING LOOP")
                    .font(.system(size: 11, weight: .medium, design: .monospaced))
                    .tracking(2.2)
                    .foregroundStyle(Color.forgeYellow)
                Spacer()
            }

            Text(entry.role == .teacher ? "Your class at a glance" : "Keep the loop moving")
                .font(.system(size: 25, weight: .bold, design: .rounded))
                .foregroundStyle(Color.forgeCream)

            if entry.role == .teacher {
                teacherLarge
            } else {
                studentLarge
            }
        }
        .padding(20)
    }

    private var studentLarge: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 5) {
                    Text("NEXT ASSIGNMENT")
                        .font(.system(size: 10, weight: .medium, design: .monospaced))
                        .tracking(1.5)
                        .foregroundStyle(Color.forgeYellow)
                    Text(entry.title)
                        .font(.system(size: 35, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.forgeCream)
                }
                Spacer()
                Text("\(entry.progress)%")
                    .font(.system(size: 31, weight: .bold, design: .rounded))
                    .foregroundStyle(Color.forgeHot)
            }
            Text(entry.detail)
                .font(.system(size: 15, weight: .medium, design: .rounded))
                .foregroundStyle(Color.forgeSlate)
            GeometryReader { proxy in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.forgeLine)
                    Capsule().fill(Color.forgeOrange).frame(width: proxy.size.width * CGFloat(entry.progress) / 100)
                }
            }
            .frame(height: 8)
            Divider().overlay(Color.forgeLine)
            VStack(alignment: .leading, spacing: 9) {
                HStack {
                    Text("ANVIL TASKS")
                    Spacer()
                    Text("10+").foregroundStyle(Color.forgeYellow)
                }
                HStack {
                    Text("STREAK")
                    Spacer()
                    Text("1 day").foregroundStyle(Color.forgeCream)
                }
                HStack {
                    Text(entry.secondary)
                    Spacer()
                    Text("Open →").foregroundStyle(Color.forgeYellow)
                }
            }
            .font(.system(size: 13, weight: .medium, design: .monospaced))
            .foregroundStyle(Color.forgeDim)
        }
    }

    private var teacherLarge: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text(entry.title)
                    .font(.system(size: 35, weight: .bold, design: .rounded))
                    .foregroundStyle(Color.forgeCream)
                Spacer()
                Text("\(entry.progress)%")
                    .font(.system(size: 31, weight: .bold, design: .rounded))
                    .foregroundStyle(Color.forgeHot)
            }
            Text("CLASS ACCURACY")
                .font(.system(size: 10, weight: .medium, design: .monospaced))
                .tracking(1.6)
                .foregroundStyle(Color.forgeDim)
            Divider().overlay(Color.forgeLine)
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    stat(String(entry.openSignals), label: "OPEN SIGNALS", color: .forgeYellow)
                    Spacer()
                    stat(String(entry.students), label: "STUDENTS", color: .forgeCream)
                }
                HStack {
                    stat(String(entry.responses), label: "RESPONSES", color: .forgeCream)
                    Spacer()
                    Text("Open class →")
                        .font(.system(size: 13, weight: .medium, design: .monospaced))
                        .foregroundStyle(Color.forgeYellow)
                }
            }
            Spacer(minLength: 1)
            Text(entry.secondary)
            .font(.system(size: 13, weight: .medium, design: .monospaced))
            .foregroundStyle(Color.forgeDim)
        }
    }

    private func stat(_ value: String, label: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(value)
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundStyle(color)
            Text(label)
                .font(.system(size: 8, weight: .medium, design: .monospaced))
                .tracking(1.1)
                .foregroundStyle(Color.forgeDim)
        }
    }
}

struct ForgeStudentWidgets: Widget {
    let kind = "ForgeStudentWidgets"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ForgeWidgetProvider(defaultRole: .student)) { entry in
            ForgeWidgetView(entry: entry)
        }
        .configurationDisplayName("Forge student progress")
        .description("See your next assignment and learning progress at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct ForgeTeacherWidgets: Widget {
    let kind = "ForgeTeacherWidgets"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ForgeTeacherWidgetIntent.self, provider: ForgeTeacherWidgetProvider()) { entry in
            ForgeWidgetView(entry: entry)
        }
        .configurationDisplayName("Forge class pulse")
        .description("See class accuracy and open signals at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct ForgeClassEntity: AppEntity, Identifiable, Hashable {
    let id: String
    let name: String

    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Class")
    static var defaultQuery = ForgeClassQuery()

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)")
    }
}

struct ForgeClassQuery: EntityQuery {
    func entities(for identifiers: [ForgeClassEntity.ID]) async throws -> [ForgeClassEntity] {
        allClasses.filter { identifiers.contains($0.id) }
    }

    func suggestedEntities() async throws -> [ForgeClassEntity] {
        allClasses
    }

    private var allClasses: [ForgeClassEntity] {
        let defaults = UserDefaults(suiteName: forgeWidgetGroup)
        if let raw = defaults?.array(forKey: "forge-widget-classes") as? [[String: String]] {
            let stored = raw.compactMap { item -> ForgeClassEntity? in
                guard let id = item["id"], let name = item["name"] else { return nil }
                return ForgeClassEntity(id: id, name: name)
            }
            if !stored.isEmpty { return stored }
        }

        return [
            ForgeClassEntity(id: "12a-ec", name: "12A/Ec"),
            ForgeClassEntity(id: "12b-bio", name: "12B/Bio"),
            ForgeClassEntity(id: "11a-psych", name: "11A/Psych")
        ]
    }
}

struct ForgeTeacherWidgetIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Choose class"
    static var description = IntentDescription("Choose which Forge class appears in this widget.")

    @Parameter(title: "Class")
    var selectedClass: ForgeClassEntity

    init() {
        selectedClass = ForgeClassEntity(id: "12a-ec", name: "12A/Ec")
    }
}

struct ForgeTeacherWidgetProvider: AppIntentTimelineProvider {
    typealias Entry = ForgeWidgetEntry
    typealias Intent = ForgeTeacherWidgetIntent

    func placeholder(in context: Context) -> ForgeWidgetEntry {
        entry(for: ForgeTeacherWidgetIntent())
    }

    func snapshot(for configuration: ForgeTeacherWidgetIntent, in context: Context) async -> ForgeWidgetEntry {
        entry(for: configuration)
    }

    func timeline(for configuration: ForgeTeacherWidgetIntent, in context: Context) async -> Timeline<ForgeWidgetEntry> {
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: .now) ?? .now.addingTimeInterval(1800)
        return Timeline(entries: [entry(for: configuration)], policy: .after(next))
    }

    private func entry(for configuration: ForgeTeacherWidgetIntent) -> ForgeWidgetEntry {
        var metrics = ForgeTeacherWidgetData()
        if let raw = UserDefaults(suiteName: forgeWidgetGroup)?.data(forKey: "forge-widget-teacher-data"),
           let stored = try? JSONDecoder().decode(ForgeTeacherWidgetData.self, from: raw),
           stored.classId.isEmpty || stored.classId == configuration.selectedClass.id || stored.className == configuration.selectedClass.name {
            metrics = stored
        }
        return ForgeWidgetEntry(
            date: .now,
            role: .teacher,
            title: configuration.selectedClass.name,
            detail: "\(metrics.accuracy)% class accuracy · \(metrics.openSignals) open signals",
            progress: min(max(metrics.accuracy, 0), 100),
            secondary: metrics.secondary,
            deepLink: URL(string: "forge://teacher-class?id=\(configuration.selectedClass.id)")!,
            openSignals: metrics.openSignals,
            students: metrics.students,
            responses: metrics.responses
        )
    }
}

@main
struct ForgeWidgetBundle: WidgetBundle {
    var body: some Widget {
        ForgeStudentWidgets()
        ForgeTeacherWidgets()
    }
}

private extension Color {
    static let forgeCoal = dynamic(light: (0.965, 0.933, 0.910), dark: (0.055, 0.047, 0.043))
    static let forgeNavy = dynamic(light: (0.09, 0.12, 0.16), dark: (0.90, 0.31, 0.04))
    static let forgeBadgeMark = dynamic(light: (0.90, 0.31, 0.04), dark: (0.09, 0.12, 0.16))
    static let forgeOrange = Color(red: 0.90, green: 0.31, blue: 0.04)
    static let forgeYellow = Color(red: 1.0, green: 0.70, blue: 0.12)
    static let forgeHot = dynamic(light: (0.82, 0.40, 0.06), dark: (1.0, 0.78, 0.16))
    static let forgeCream = dynamic(light: (0.145, 0.13, 0.12), dark: (0.97, 0.95, 0.91))
    static let forgeSlate = dynamic(light: (0.42, 0.38, 0.35), dark: (0.72, 0.69, 0.65))
    static let forgeDim = dynamic(light: (0.55, 0.50, 0.46), dark: (0.54, 0.51, 0.48))
    static let forgeLine = dynamic(light: (0.83, 0.78, 0.74), dark: (0.24, 0.22, 0.20))

    static func dynamic(light: (CGFloat, CGFloat, CGFloat), dark: (CGFloat, CGFloat, CGFloat)) -> Color {
        Color(uiColor: UIColor { traits in
            let rgb = traits.userInterfaceStyle == .dark ? dark : light
            return UIColor(red: rgb.0, green: rgb.1, blue: rgb.2, alpha: 1)
        })
    }
}
