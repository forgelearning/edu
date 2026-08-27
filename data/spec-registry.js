// Canonical exam-board specification metadata for Forge.
//
// This file deliberately contains specification structure, not question data.
// Question banks may keep their existing `spec` value while a subject is
// migrated; validation resolves that value through this registry.  Once a
// subject is fully migrated, questions can additionally use `specPointId`.

const SPEC_REGISTRY = {
  version: 1,
  // Some exam boards offer optional routes. Keep those exclusions explicit
  // so the coverage audit distinguishes "not delivered" from "not covered".
  routeExclusions: {},
  points: {
    "edexcel-a-econ-1.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 1",
      code: "1.1",
      title: "Supply and demand",
      aliases: ["ECON-1.1"]
    },
    "edexcel-a-econ-2.1.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.1.1",
      title: "Economic growth",
      aliases: ["2.1.1"]
    },
    "edexcel-a-econ-2.1.2": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.1.2",
      title: "Inflation",
      aliases: ["2.1.2"]
    },
    "edexcel-a-econ-2.1.3": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.1.3",
      title: "Employment and unemployment",
      aliases: ["2.1.3"]
    },
    "edexcel-a-econ-2.1.4": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.1.4",
      title: "Balance of payments",
      aliases: ["2.1.4"]
    },
    "edexcel-a-econ-2.2.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.2.1",
      title: "Aggregate demand",
      aliases: ["2.2.1"]
    },
    "edexcel-a-econ-2.2.2": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.2.2",
      title: "Aggregate supply",
      aliases: ["2.2.2"]
    },
    "edexcel-a-econ-2.2.3": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.2.3",
      title: "National income",
      aliases: ["2.2.3"]
    },
    "edexcel-a-econ-2.3.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.3.1",
      title: "Fiscal policy",
      aliases: ["2.3.1"]
    },
    "edexcel-a-econ-2.3.2": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.3.2",
      title: "Monetary policy",
      aliases: ["2.3.2"]
    },
    "edexcel-a-econ-2.3.3": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.3.3",
      title: "Supply-side policies",
      aliases: ["2.3.3"]
    },
    "edexcel-a-econ-2.4.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.4.1",
      title: "Inequality",
      aliases: ["2.4.1"]
    },
    "edexcel-a-econ-2.4.2": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.4.2",
      title: "Poverty",
      aliases: ["2.4.2"]
    },
    "edexcel-a-econ-2.5.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.5.1",
      title: "Financial markets",
      aliases: ["2.5.1"]
    },
    "edexcel-a-econ-2.5.2": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.5.2",
      title: "Role of banks",
      aliases: ["2.5.2"]
    },
    "edexcel-a-econ-2.5.3": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.5.3",
      title: "Central banks",
      aliases: ["2.5.3"]
    },
    "edexcel-a-econ-3.1.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 3",
      code: "3.1.1",
      title: "Business growth and objectives",
      aliases: ["3.1.1"]
    },
    "edexcel-a-econ-3.2.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 3",
      code: "3.2.1",
      title: "Revenue, costs and profit",
      aliases: ["3.2.1"]
    },
    "edexcel-a-econ-4.1.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 3",
      code: "4.1.1",
      title: "Globalisation and trade",
      aliases: ["4.1.1"]
    },

    "aqa-a-psych-3.1.1": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 1",
      code: "3.1.1", title: "Social influence", aliases: ["PSY-SI"]
    },
    "aqa-a-psych-3.1.2": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 1",
      code: "3.1.2", title: "Memory", aliases: ["PSY-MEM"]
    },
    "aqa-a-psych-3.1.3": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 1",
      code: "3.1.3", title: "Attachment", aliases: ["PSY-ATT"]
    },
    "aqa-a-psych-3.1.4": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 1",
      code: "3.1.4", title: "Psychopathology", aliases: ["PSY-PATH"]
    },
    "aqa-a-psych-3.2.1": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 2",
      code: "3.2.1", title: "Approaches in Psychology", aliases: ["PSY-APP"]
    },
    "aqa-a-psych-3.2.2": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 2",
      code: "3.2.2", title: "Biopsychology", aliases: ["PSY-BIO"]
    },
    "aqa-a-psych-3.2.3": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 2",
      code: "3.2.3", title: "Research methods", aliases: ["PSY-RM"]
    },
    "aqa-a-psych-3.3.1": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.1", title: "Issues and debates in Psychology", aliases: ["PSY-ID"]
    },
    "aqa-a-psych-3.3.2": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.2", title: "Relationships", aliases: ["PSY-REL"]
    },
    "aqa-a-psych-3.3.3": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.3", title: "Gender", aliases: ["PSY-GEN"]
    },
    "aqa-a-psych-3.3.4": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.4", title: "Cognition and development", aliases: ["PSY-COG"]
    },
    "aqa-a-psych-3.3.5": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.5", title: "Schizophrenia", aliases: ["PSY-SCH"]
    },
    "aqa-a-psych-3.3.6": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.6", title: "Eating behaviour", aliases: ["PSY-EAT"]
    },
    "aqa-a-psych-3.3.7": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.7", title: "Stress", aliases: ["PSY-STR"]
    },
    "aqa-a-psych-3.3.8": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.8", title: "Aggression", aliases: ["PSY-AGG"]
    },
    "aqa-a-psych-3.3.9": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.9", title: "Forensic Psychology", aliases: ["PSY-FOR"]
    },
    "aqa-a-psych-3.3.10": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.10", title: "Addiction", aliases: ["PSY-ADD"]
    },

    "aqa-a-soc-3.1.1": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 1",
      code: "3.1.1", title: "Education", aliases: ["SOC-EDU"]
    },
    "aqa-a-soc-3.1.2": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 1",
      code: "3.1.2", title: "Methods in Context", aliases: ["SOC-MET"]
    },
    "aqa-a-soc-3.1.3": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 1",
      code: "3.1.3", title: "Theory and Methods", aliases: ["SOC-THEORY"]
    },
    "aqa-a-soc-3.2.1": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.1", title: "Culture and Identity", aliases: []
    },
    "aqa-a-soc-3.2.2": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.2", title: "Families and Households", aliases: ["SOC-FAM"]
    },
    "aqa-a-soc-3.2.3": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.3", title: "Health", aliases: []
    },
    "aqa-a-soc-3.2.4": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.4", title: "Work, Poverty and Welfare", aliases: []
    },
    "aqa-a-soc-3.2.5": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.5", title: "Beliefs in Society", aliases: ["SOC-BEL"]
    },
    "aqa-a-soc-3.2.6": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.6", title: "Global Development", aliases: ["SOC-GLOB"]
    },
    "aqa-a-soc-3.2.7": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.7", title: "The Media", aliases: ["SOC-MED"]
    },
    "aqa-a-soc-3.2.8": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.8", title: "Stratification and Differentiation", aliases: ["SOC-STRAT"]
    },
    "aqa-a-soc-3.3.1": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 3",
      code: "3.3.1", title: "Crime and Deviance", aliases: ["SOC-CRIME"]
    },
    "aqa-a-soc-3.3.2": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 3",
      code: "3.3.2", title: "Theory and Methods", aliases: ["SOC-RESEARCH"]
    }
  },

  aliases: {
    "ECON-1.1": "edexcel-a-econ-1.1",
    "1.1": "edexcel-a-econ-1.1",
    "2.1.1": "edexcel-a-econ-2.1.1",
    "2.1.2": "edexcel-a-econ-2.1.2",
    "2.1.3": "edexcel-a-econ-2.1.3",
    "2.1.4": "edexcel-a-econ-2.1.4",
    "2.2.1": "edexcel-a-econ-2.2.1",
    "2.2.2": "edexcel-a-econ-2.2.2",
    "2.2.3": "edexcel-a-econ-2.2.3",
    "2.3.1": "edexcel-a-econ-2.3.1",
    "2.3.2": "edexcel-a-econ-2.3.2",
    "2.3.3": "edexcel-a-econ-2.3.3",
    "2.4.1": "edexcel-a-econ-2.4.1",
    "2.4.2": "edexcel-a-econ-2.4.2",
    "2.5.1": "edexcel-a-econ-2.5.1",
    "2.5.2": "edexcel-a-econ-2.5.2",
    "2.5.3": "edexcel-a-econ-2.5.3",
    "3.1.1": "edexcel-a-econ-3.1.1",
    "3.2.1": "edexcel-a-econ-3.2.1",
    "4.1.1": "edexcel-a-econ-4.1.1"
    ,"PSY-SI": "aqa-a-psych-3.1.1"
    ,"PSY-MEM": "aqa-a-psych-3.1.2"
    ,"PSY-ATT": "aqa-a-psych-3.1.3"
    ,"PSY-PATH": "aqa-a-psych-3.1.4"
    ,"PSY-APP": "aqa-a-psych-3.2.1"
    ,"PSY-BIO": "aqa-a-psych-3.2.2"
    ,"PSY-RM": "aqa-a-psych-3.2.3"
    ,"PSY-ID": "aqa-a-psych-3.3.1"
    ,"PSY-REL": "aqa-a-psych-3.3.2"
    ,"PSY-GEN": "aqa-a-psych-3.3.3"
    ,"PSY-COG": "aqa-a-psych-3.3.4"
    ,"PSY-SCH": "aqa-a-psych-3.3.5"
    ,"PSY-EAT": "aqa-a-psych-3.3.6"
    ,"PSY-STR": "aqa-a-psych-3.3.7"
    ,"PSY-AGG": "aqa-a-psych-3.3.8"
    ,"PSY-FOR": "aqa-a-psych-3.3.9"
    ,"PSY-ADD": "aqa-a-psych-3.3.10"
    ,"SOC-EDU": "aqa-a-soc-3.1.1"
    ,"SOC-MET": "aqa-a-soc-3.1.2"
    ,"SOC-THEORY": "aqa-a-soc-3.1.3"
    ,"SOC-FAM": "aqa-a-soc-3.2.2"
    ,"SOC-BEL": "aqa-a-soc-3.2.5"
    ,"SOC-GLOB": "aqa-a-soc-3.2.6"
    ,"SOC-MED": "aqa-a-soc-3.2.7"
    ,"SOC-STRAT": "aqa-a-soc-3.2.8"
    ,"SOC-CRIME": "aqa-a-soc-3.3.1"
    ,"SOC-RESEARCH": "aqa-a-soc-3.3.2"
  }
};

// Edexcel A Level Geography (9GE0), Issue 6.  The numbered key ideas are
// registered even where an existing broad bank still needs finer question-
// level tagging.  Broad-bank aliases below deliberately point to the topic
// level so the audit does not imply false precision.
const geographySpecTopics = [
  ["Paper 1", "1", "Tectonic Processes and Hazards", 9],
  ["Paper 1", "2A", "Glaciated Landscapes and Change", 12],
  ["Paper 1", "2B", "Coastal Landscapes and Change", 12],
  ["Paper 2", "3", "Globalisation", 9],
  ["Paper 2", "4A", "Regenerating Places", 9],
  ["Paper 2", "4B", "Diverse Places", 12],
  ["Paper 1", "5", "The Water Cycle and Water Insecurity", 8],
  ["Paper 1", "6", "The Carbon Cycle and Energy Security", 9],
  ["Paper 2", "7", "Superpowers", 9],
  ["Paper 2", "8A", "Health, Human Rights and Intervention", 12],
  ["Paper 2", "8B", "Migration, Identity and Sovereignty", 12]
];
for (const [paper, prefix, title, count] of geographySpecTopics) {
  for (let index = 1; index <= count; index += 1) {
    const code = `${prefix}.${index}`;
    SPEC_REGISTRY.points[`edexcel-a-geo-${code}`] = {
      subject: "geo", board: "Edexcel", qualification: "A Level Geography (9GE0)",
      paper, code, title: `${title} — key idea ${code}`, aliases: []
    };
  }
}
for (const [topicId, title, paper, code] of [
  ["topic-1", "Tectonic Processes and Hazards", "Paper 1", "Topic 1"],
  ["topic-2b", "Coastal Landscapes and Change", "Paper 1", "Topic 2B"],
  ["topic-3", "Globalisation", "Paper 2", "Topic 3"],
  ["topic-4a", "Regenerating Places", "Paper 2", "Topic 4A"],
  ["topic-5", "The Water Cycle and Water Insecurity", "Paper 1", "Topic 5"],
  ["topic-6", "The Carbon Cycle and Energy Security", "Paper 1", "Topic 6"],
  ["topic-7", "Superpowers", "Paper 2", "Topic 7"],
  ["topic-8a", "Health, Human Rights and Intervention", "Paper 2", "Topic 8A"]
]) {
  SPEC_REGISTRY.points[`edexcel-a-geo-${topicId}`] = {
    subject: "geo", board: "Edexcel", qualification: "A Level Geography (9GE0)",
    paper, code, title, aliases: []
  };
}
for (const [code, title] of [
  ["P3-PLAYERS", "Paper 3 synoptic theme — Players"],
  ["P3-ATTITUDES", "Paper 3 synoptic theme — Attitudes and actions"],
  ["P3-FUTURES", "Paper 3 synoptic theme — Futures and uncertainties"]
]) {
  SPEC_REGISTRY.points[`edexcel-a-geo-${code.toLowerCase()}`] = {
    subject: "geo", board: "Edexcel", qualification: "A Level Geography (9GE0)",
    paper: "Paper 3", code, title, aliases: []
  };
}
Object.assign(SPEC_REGISTRY.aliases, {
  "TECH": "edexcel-a-geo-topic-1",
  "GEO-TEC": "edexcel-a-geo-topic-1",
  "9GE0-TEC": "edexcel-a-geo-topic-1",
  "GEO-COAST": "edexcel-a-geo-topic-2b",
  "9GE0-COAST": "edexcel-a-geo-topic-2b",
  "GEO-REGEN": "edexcel-a-geo-topic-4a",
  "9GE0-REGEN": "edexcel-a-geo-topic-4a",
  "GEO-P3": "edexcel-a-geo-topic-3",
  "9GE0-P3": "edexcel-a-geo-topic-3",
  "GEO-WATER": "edexcel-a-geo-topic-5",
  "9GE0-WATER": "edexcel-a-geo-topic-5",
  "GEO-CARBON": "edexcel-a-geo-topic-6",
  "9GE0-CARBON": "edexcel-a-geo-topic-6",
  "GEO-SUPER": "edexcel-a-geo-topic-7",
  "9GE0-SUPER": "edexcel-a-geo-topic-7",
  "GEO-HEALTH": "edexcel-a-geo-topic-8a",
  "GEO-GLOBAL": "edexcel-a-geo-topic-3",
  "9GE0-HEALTH": "edexcel-a-geo-topic-8a"
});

// The school-delivered Edexcel Geography route uses coastal landscapes,
// regenerating places and migration-related health/globalisation content;
// these three alternatives are specification-valid but are not taught on
// the selected route shown in the options information.
for (const [prefix, title] of [
  ["2A", "Glaciated Landscapes and Change"],
  ["4B", "Diverse Places"],
  ["8B", "Migration, Identity and Sovereignty"]
]) {
  for (const pointId of Object.keys(SPEC_REGISTRY.points)) {
    const point = SPEC_REGISTRY.points[pointId];
    if (point.subject === "geo" && point.code.startsWith(`${prefix}.`)) {
      SPEC_REGISTRY.routeExclusions[pointId] = {
        reason: "Alternative Edexcel route not delivered on the selected school course",
        title
      };
    }
  }
}

// AQA A-level History (7042), using the section structure published for the
// selected options in this project.  The Tudor bank is the content context
// for Component 3; the NEA points therefore describe the historical-
// investigation skills rather than pretending it is an examined option.
const historySpecPoints = [
  ["2m-1", "Paper 2", "2M.1", "The Liberal crisis, 1906–1914"],
  ["2m-2", "Paper 2", "2M.2", "The impact of war, 1914–1922"],
  ["2m-3", "Paper 2", "2M.3", "The search for stability, 1922–1929"],
  ["2m-4", "Paper 2", "2M.4", "The Hungry Thirties, 1929–1939"],
  ["2m-5", "Paper 2", "2M.5", "The People's War and Peace, 1939–1951"],
  ["2m-6", "Paper 2", "2M.6", "Never had it so good? 1951–1957"],
  ["1k-1", "Paper 1", "1K.1", "The Era of Reconstruction and the Gilded Age, 1865–1890"],
  ["1k-2", "Paper 1", "1K.2", "Populism, progressivism and imperialism, 1890–1920"],
  ["1k-3", "Paper 1", "1K.3", "Crisis of identity, 1920–1945"],
  ["1k-4", "Paper 1", "1K.4", "The Superpower, 1945–1975"],
  ["nea-1", "Component 3", "NEA.1", "Historical issue, context and significant questions"],
  ["nea-2", "Component 3", "NEA.2", "Research and evaluation of primary and secondary sources"],
  ["nea-3", "Component 3", "NEA.3", "Interpretations, sustained argument and judgement"],
  ["nea-content", "Component 3", "NEA.CONTENT", "Tudor investigation content context"]
];
for (const [id, paper, code, title] of historySpecPoints) {
  SPEC_REGISTRY.points[`aqa-a-hist-${id}`] = {
    subject: "hist", board: "AQA", qualification: "A-level History (7042)",
    paper, code, title, aliases: []
  };
}
Object.assign(SPEC_REGISTRY.aliases, {
  "HIST-BRIT1": "aqa-a-hist-2m-1",
  "HIST-BRIT2": "aqa-a-hist-2m-3",
  "HIST-USA1": "aqa-a-hist-1k-1",
  "HIST-USA2": "aqa-a-hist-1k-3",
  "HIST-TUDOR": "aqa-a-hist-nea-content",
  "AQA-2M-BRIT1": "aqa-a-hist-2m-1",
  "AQA-2M-BRIT2": "aqa-a-hist-2m-3",
  "AQA-1K-USA1": "aqa-a-hist-1k-1",
  "AQA-1K-USA2": "aqa-a-hist-1k-3",
  "AQA-NEA-TUDOR": "aqa-a-hist-nea-content"
});

// Pearson Edexcel A-level Business (9BS0). The four themes are split into
// their numbered specification sections so existing mixed practice banks can
// carry precise question-level coverage as they are migrated.
const businessSpecPoints = [
  ["1.1", "Theme 1", "Meeting customer needs"],
  ["1.2", "Theme 1", "The market"],
  ["1.3", "Theme 1", "Marketing mix and strategy"],
  ["1.4", "Theme 1", "Managing people"],
  ["1.5", "Theme 1", "Entrepreneurs and leaders"],
  ["2.1", "Theme 2", "Raising finance"],
  ["2.2", "Theme 2", "Financial planning"],
  ["2.3", "Theme 2", "Managing finance"],
  ["2.4", "Theme 2", "Resource management"],
  ["2.5", "Theme 2", "External influences"],
  ["3.1", "Theme 3", "Business objectives and strategy"],
  ["3.2", "Theme 3", "Business growth"],
  ["3.3", "Theme 3", "Decision-making techniques"],
  ["3.4", "Theme 3", "Influences on business decisions"],
  ["3.5", "Theme 3", "Assessing competitiveness"],
  ["3.6", "Theme 3", "Managing change"],
  ["4.1", "Theme 4", "Globalisation"],
  ["4.2", "Theme 4", "Global markets and business expansion"],
  ["4.3", "Theme 4", "Global marketing"],
  ["4.4", "Theme 4", "Global industries and companies (multinational corporations)"]
];
for (const [code, paper, title] of businessSpecPoints) {
  SPEC_REGISTRY.points[`edexcel-a-bus-${code}`] = {
    subject: "bus", board: "Edexcel", qualification: "A Level Business (9BS0)",
    paper, code, title, aliases: []
  };
}
Object.assign(SPEC_REGISTRY.aliases, {
  "BUS-1": "edexcel-a-bus-1.1",
  "BUS-2": "edexcel-a-bus-2.1",
  "BUS-3": "edexcel-a-bus-3.1",
  "BUS-4": "edexcel-a-bus-4.1"
});

// AQA A-level Chemistry (7405), using the numbered physical, inorganic and
// organic chemistry sections in the published specification.
const chemistrySpecPoints = [
  ["3.1.1", "Paper 1 / Paper 2", "Atomic structure"],
  ["3.1.2", "Paper 1 / Paper 2", "Amount of substance"],
  ["3.1.3", "Paper 1 / Paper 2", "Bonding"],
  ["3.1.4", "Paper 1 / Paper 2", "Energetics"],
  ["3.1.5", "Paper 2", "Kinetics"],
  ["3.1.6", "Paper 1 / Paper 2", "Chemical equilibria, Le Chatelier’s principle and Kc"],
  ["3.1.7", "Paper 1", "Oxidation, reduction and redox equations"],
  ["3.1.8", "Paper 1", "Thermodynamics"],
  ["3.1.9", "Paper 2", "Rate equations"],
  ["3.1.10", "Paper 1", "Equilibrium constant Kp for homogeneous systems"],
  ["3.1.11", "Paper 1", "Electrode potentials and electrochemical cells"],
  ["3.1.12", "Paper 1", "Acids and bases"],
  ["3.2.1", "Paper 1", "Periodicity"],
  ["3.2.2", "Paper 1", "Group 2, the alkaline earth metals"],
  ["3.2.3", "Paper 1", "Group 7(17), the halogens"],
  ["3.2.4", "Paper 1", "Properties of Period 3 elements and their oxides"],
  ["3.2.5", "Paper 1", "Transition metals"],
  ["3.2.6", "Paper 1", "Reactions of ions in aqueous solution"],
  ["3.3.1", "Paper 2", "Introduction to organic chemistry"],
  ["3.3.2", "Paper 2", "Alkanes"],
  ["3.3.3", "Paper 2", "Halogenoalkanes"],
  ["3.3.4", "Paper 2", "Alkenes"],
  ["3.3.5", "Paper 2", "Alcohols"],
  ["3.3.6", "Paper 2", "Organic analysis"],
  ["3.3.7", "Paper 2", "Optical isomerism"],
  ["3.3.8", "Paper 2", "Aldehydes and ketones"],
  ["3.3.9", "Paper 2", "Carboxylic acids and derivatives"],
  ["3.3.10", "Paper 2", "Aromatic chemistry"],
  ["3.3.11", "Paper 2", "Amines"],
  ["3.3.12", "Paper 2", "Polymers"],
  ["3.3.13", "Paper 2", "Amino acids, proteins and DNA"],
  ["3.3.14", "Paper 2", "Organic synthesis"],
  ["3.3.15", "Paper 2", "Nuclear magnetic resonance spectroscopy"],
  ["3.3.16", "Paper 2", "Chromatography"]
];
for (const [code, paper, title] of chemistrySpecPoints) {
  SPEC_REGISTRY.points[`aqa-a-chem-${code}`] = {
    subject: "chem", board: "AQA", qualification: "A-level Chemistry (7405)",
    paper, code, title, aliases: []
  };
}
Object.assign(SPEC_REGISTRY.aliases, {
  "CHEM-1": "aqa-a-chem-3.1.1",
  "CHEM-2": "aqa-a-chem-3.1.4",
  "CHEM-3": "aqa-a-chem-3.3.1"
});

// OCR A Level Biology A (H420), using the numbered module topics in the
// published specification.  Module 1 covers practical skills assessed in
// the written papers and the Practical Endorsement.
const biologySpecPoints = [
  ["1.1", "Papers 1–3 / Practical Endorsement", "Development of practical skills in biology"],
  ["2.1", "Papers 1–3", "Cell structure"],
  ["2.2", "Papers 1–3", "Biological molecules"],
  ["2.3", "Papers 1–3", "Nucleotides and nucleic acids"],
  ["2.4", "Papers 1–3", "Enzymes"],
  ["2.5", "Papers 1–3", "Biological membranes"],
  ["2.6", "Papers 1–3", "Cell division, cell diversity and cellular organisation"],
  ["3.1", "Papers 1–3", "Exchange surfaces"],
  ["3.2", "Papers 1–3", "Transport in animals"],
  ["3.3", "Papers 1–3", "Transport in plants"],
  ["4.1", "Papers 1–3", "Communicable diseases, disease prevention and the immune system"],
  ["4.2", "Papers 1–3", "Biodiversity"],
  ["4.3", "Papers 1–3", "Classification and evolution"],
  ["5.1", "Papers 1–3", "Communication and homeostasis"],
  ["5.2", "Papers 1–3", "Excretion as an example of homeostatic control"],
  ["5.3", "Papers 1–3", "Neuronal communication"],
  ["5.4", "Papers 1–3", "Hormonal communication"],
  ["5.5", "Papers 1–3", "Plant and animal responses"],
  ["5.6", "Papers 1–3", "Photosynthesis"],
  ["5.7", "Papers 1–3", "Respiration"],
  ["6.1", "Papers 1–3", "Cellular control"],
  ["6.2", "Papers 1–3", "Patterns of inheritance"],
  ["6.3", "Papers 1–3", "Manipulating genomes"],
  ["6.4", "Papers 1–3", "Cloning and biotechnology"],
  ["6.5", "Papers 1–3", "Ecosystems"],
  ["6.6", "Papers 1–3", "Populations and sustainability"]
];
for (const [code, paper, title] of biologySpecPoints) {
  SPEC_REGISTRY.points[`ocr-a-bio-${code}`] = {
    subject: "bio", board: "OCR", qualification: "A-level Biology A (H420)",
    paper, code, title, aliases: []
  };
}
Object.assign(SPEC_REGISTRY.aliases, {
  "BIO-1": "ocr-a-bio-2.1",
  "BIO-2": "ocr-a-bio-3.1",
  "BIO-3": "ocr-a-bio-6.1",
  "BIO-ENZ": "ocr-a-bio-2.4"
});

// AQA A-level Physics (7408), using the core and optional topic sections in
// the published specification.
const physicsSpecPoints = [
  ["3.1", "Papers 1–3", "Measurements and their errors"],
  ["3.2", "Papers 1–3", "Particles and radiation"],
  ["3.3", "Papers 1–3", "Waves"],
  ["3.4", "Paper 1", "Mechanics and materials"],
  ["3.5", "Paper 1", "Electricity"],
  ["3.6", "Papers 1–2", "Further mechanics and thermal physics"],
  ["3.7", "Paper 2", "Fields and their consequences"],
  ["3.8", "Paper 2", "Nuclear physics"],
  ["3.9", "Paper 3", "Astrophysics"],
  ["3.10", "Paper 3", "Medical physics"],
  ["3.11", "Paper 3", "Engineering physics"],
  ["3.12", "Paper 3", "Turning points in physics"],
  ["3.13", "Paper 3", "Electronics"]
];
for (const [code, paper, title] of physicsSpecPoints) {
  SPEC_REGISTRY.points[`aqa-a-phys-${code}`] = {
    subject: "phys", board: "AQA", qualification: "A-level Physics (7408)",
    paper, code, title, aliases: []
  };
}
Object.assign(SPEC_REGISTRY.aliases, {
  "PHYS-1": "aqa-a-phys-3.4",
  "PHYS-2": "aqa-a-phys-3.5",
  "PHYS-3": "aqa-a-phys-3.3"
});

// Eduqas A-level Computer Science (A500QS), using the specification's three
// assessment components and their published content areas.
const computerScienceSpecPoints = [
  ["1.1", "Component 1", "Elements of computational thinking"],
  ["1.2", "Component 1", "Problem solving and programming"],
  ["1.3", "Component 1", "Algorithms to solve problems and standard algorithms"],
  ["2.1", "Component 2", "Characteristics of contemporary processors"],
  ["2.2", "Component 2", "Software and software development"],
  ["2.3", "Component 2", "Exchanging data"],
  ["2.4", "Component 2", "Data types, data structures and algorithms"],
  ["2.5", "Component 2", "Legal, moral, cultural and ethical issues"],
  ["3.1", "Component 3", "Programmed solution to a problem"],
  ["3.2", "Component 3", "Analysis, design, development, testing and evaluation"]
];
for (const [code, paper, title] of computerScienceSpecPoints) {
  SPEC_REGISTRY.points[`eduqas-a-cs-${code}`] = {
    subject: "cs", board: "Eduqas", qualification: "A-level Computer Science (A500QS)",
    paper, code, title, aliases: []
  };
}
Object.assign(SPEC_REGISTRY.aliases, {
  "CS-1": "eduqas-a-cs-1.1",
  "CS-2": "eduqas-a-cs-2.1",
  "CS-3": "eduqas-a-cs-1.2",
  "CS-4": "eduqas-a-cs-2.2"
});

// Pearson Edexcel A-level Mathematics (9MA0), using the numbered Pure,
// Statistics and Mechanics topics from the specification.
const mathematicsSpecPoints = [
  ["1.1", "Papers 1–3", "Proof"],
  ["2.1", "Papers 1–2", "Algebra and functions"],
  ["2.2", "Papers 1–2", "Coordinate geometry"],
  ["2.3", "Papers 1–2", "Sequences and series"],
  ["2.4", "Papers 1–2", "Trigonometry"],
  ["2.5", "Papers 1–2", "Exponentials and logarithms"],
  ["2.6", "Papers 1–2", "Differentiation"],
  ["2.7", "Papers 1–2", "Integration"],
  ["2.8", "Papers 1–2", "Numerical methods"],
  ["2.9", "Papers 1–2", "Vectors"],
  ["3.1", "Paper 3", "Statistical sampling"],
  ["3.2", "Paper 3", "Data presentation and interpretation"],
  ["3.3", "Paper 3", "Probability"],
  ["3.4", "Paper 3", "Statistical distributions"],
  ["3.5", "Paper 3", "Statistical hypothesis testing"],
  ["4.1", "Paper 3", "Quantities and units in mechanics"],
  ["4.2", "Paper 3", "Kinematics"],
  ["4.3", "Paper 3", "Forces and Newton's laws"],
  ["4.4", "Paper 3", "Moments"],
  ["4.5", "Paper 3", "Vectors in mechanics"]
];
for (const [code, paper, title] of mathematicsSpecPoints) {
  SPEC_REGISTRY.points[`edexcel-a-maths-${code}`] = {
    subject: "maths", board: "Edexcel", qualification: "A-level Mathematics (9MA0)",
    paper, code, title, aliases: []
  };
}
Object.assign(SPEC_REGISTRY.aliases, {
  "MATH-1": "edexcel-a-maths-2.1",
  "MATH-2": "edexcel-a-maths-2.6",
  "MATH-3": "edexcel-a-maths-3.1"
});

// Pearson Edexcel A-level French (9FR0), using the four published themes
// and the three assessment papers as the canonical content/skill points.
const frenchSpecPoints = [
  ["1.1", "Papers 1–3", "Les changements dans les structures familiales"],
  ["1.2", "Papers 1–3", "L'éducation"],
  ["1.3", "Papers 1–3", "Le monde du travail"],
  ["2.1", "Papers 1–3", "La musique"],
  ["2.2", "Papers 1–3", "Les médias"],
  ["2.3", "Papers 1–3", "Les festivals et les traditions"],
  ["3.1", "Papers 1–3", "L'impact positif de l'immigration sur la société française"],
  ["3.2", "Papers 1–3", "Répondre aux défis de l'immigration et de l'intégration en France"],
  ["3.3", "Papers 1–3", "L'extrême droite"],
  ["4.1", "Papers 1–3", "La France occupée"],
  ["4.2", "Papers 1–3", "Le régime de Vichy"],
  ["4.3", "Papers 1–3", "La Résistance"],
  ["P1", "Paper 1", "Listening, reading and translation"],
  ["P2", "Paper 2", "Written response to works and translation"],
  ["P3", "Paper 3", "Speaking and independent research"]
];
for (const [code, paper, title] of frenchSpecPoints) {
  SPEC_REGISTRY.points[`edexcel-a-french-${code}`] = {
    subject: "french", board: "Edexcel", qualification: "A-level French (9FR0)",
    paper, code, title, aliases: []
  };
}
Object.assign(SPEC_REGISTRY.aliases, {
  "FR-1": "edexcel-a-french-P1",
  "FR-2": "edexcel-a-french-P2"
});

// Pearson Edexcel A-level German (9GN0), using the four published themes
// and the three assessment papers as the canonical content/skill points.
const germanSpecPoints = [
  ["1.1", "Papers 1–3", "Natur und Umwelt"],
  ["1.2", "Papers 1–3", "Bildung"],
  ["1.3", "Papers 1–3", "Die Welt der Arbeit"],
  ["2.1", "Papers 1–3", "Musik"],
  ["2.2", "Papers 1–3", "Die Medien"],
  ["2.3", "Papers 1–3", "Die Rolle von Festen und Traditionen"],
  ["3.1", "Papers 1–3", "Die positive Auswirkung von Immigration"],
  ["3.2", "Papers 1–3", "Die Herausforderungen von Immigration und Integration"],
  ["3.3", "Papers 1–3", "Die staatliche und soziale Reaktion zur Immigration"],
  ["4.1", "Papers 1–3", "Die Gesellschaft in der DDR vor der Wiedervereinigung"],
  ["4.2", "Papers 1–3", "Ereignisse vor der Wiedervereinigung"],
  ["4.3", "Papers 1–3", "Deutschland seit der Wiedervereinigung"],
  ["P1", "Paper 1", "Listening, reading and translation"],
  ["P2", "Paper 2", "Written response to works and translation"],
  ["P3", "Paper 3", "Speaking and independent research"]
];
for (const [code, paper, title] of germanSpecPoints) {
  SPEC_REGISTRY.points[`edexcel-a-german-${code}`] = {
    subject: "german", board: "Edexcel", qualification: "A-level German (9GN0)",
    paper, code, title, aliases: []
  };
}
Object.assign(SPEC_REGISTRY.aliases, {
  "DE-1": "edexcel-a-german-P1",
  "DE-2": "edexcel-a-german-P2"
});

// Pearson Edexcel A-level Spanish (9SP0), using the four published themes
// and the three assessment papers as the canonical content/skill points.
const spanishSpecPoints = [
  ["1.1", "Papers 1–3", "El cambio en la estructura familiar"],
  ["1.2", "Papers 1–3", "El mundo laboral"],
  ["1.3", "Papers 1–3", "El impacto turístico en España"],
  ["2.1", "Papers 1–3", "La música"],
  ["2.2", "Papers 1–3", "Los medios de comunicación"],
  ["2.3", "Papers 1–3", "Los festivales y las tradiciones"],
  ["3.1", "Papers 1–3", "El impacto positivo de la inmigración en la sociedad Española"],
  ["3.2", "Papers 1–3", "Enfrentando los desafíos de la inmigración y la integración en España"],
  ["3.3", "Papers 1–3", "La reacción social y pública hacia la inmigración en España"],
  ["4.1", "Papers 1–3", "La Guerra Civil y el ascenso de Franco (1936–1939)"],
  ["4.2", "Papers 1–3", "La dictadura franquista"],
  ["4.3", "Papers 1–3", "La transición de la dictadura a la democracia"],
  ["P1", "Paper 1", "Listening, reading and translation"],
  ["P2", "Paper 2", "Written response to works and translation"],
  ["P3", "Paper 3", "Speaking and independent research"]
];
for (const [code, paper, title] of spanishSpecPoints) {
  SPEC_REGISTRY.points[`edexcel-a-spanish-${code}`] = {
    subject: "span", board: "Edexcel", qualification: "A-level Spanish (9SP0)",
    paper, code, title, aliases: []
  };
}
Object.assign(SPEC_REGISTRY.aliases, {
  "SPAN-1": "edexcel-a-spanish-P1",
  "SPAN-2": "edexcel-a-spanish-P2"
});

// OCR A Level Law (H418).  The school route uses the compulsory criminal-law
// and tort components, together with the Contract option for Paper 3.  Human
// Rights (H418/03) is deliberately not registered here because it is not part
// of the delivered course route.
const lawSpecPoints = [
  ["OCR-LAW-P1", "Paper 1", "The English legal system and criminal law"],
  ["OCR-LAW-P2-SYS", "Paper 2", "The English legal system and law making"],
  ["OCR-LAW-P2-TORT", "Paper 2", "The law of tort"],
  ["OCR-LAW-P3", "Paper 3", "The nature of law and the law of contract"]
];
for (const [code, paper, title] of lawSpecPoints) {
  SPEC_REGISTRY.points[`ocr-a-law-${code.toLowerCase()}`] = {
    subject: "law", board: "OCR", qualification: "A Level Law (H418)",
    paper, code, title, aliases: [code]
  };
}
Object.assign(SPEC_REGISTRY.aliases, {
  "LAW-CRIM": "ocr-a-law-ocr-law-p1",
  "LAW-SYSTEM": "ocr-a-law-ocr-law-p2-sys",
  "LAW-TORT": "ocr-a-law-ocr-law-p2-tort",
  "LAW-CONTRACT": "ocr-a-law-ocr-law-p3",
  "OCR-LAW-P1": "ocr-a-law-ocr-law-p1",
  "OCR-LAW-P2-SYS": "ocr-a-law-ocr-law-p2-sys",
  "OCR-LAW-P2-TORT": "ocr-a-law-ocr-law-p2-tort",
  "OCR-LAW-P3": "ocr-a-law-ocr-law-p3"
});

// Remaining live A-level routes. These component-level points mirror the
// delivered banks and keep coursework components explicit where no recall
// bank is appropriate.
const remainingAlevelPoints = [
  ["pol", "Edexcel", "A Level Politics (9PL0)", [
    ["P1-UKPOL", "Paper 1", "UK politics"],
    ["P2-UKGOV", "Paper 2", "UK government"],
    ["P3-USGOV", "Paper 3", "US government"],
    ["P3-USPOL", "Paper 3", "US politics and participation"]
  ]],
  ["rs", "Eduqas", "A Level Religious Studies (A120QS)", [
    ["C1", "Component 1", "A study of religion: Buddhism"],
    ["C2", "Component 2", "Philosophy of religion"],
    ["C3", "Component 3", "Religion and ethics"]
  ]],
  ["hsc", "OCR", "Cambridge Technical Health and Social Care (H128)", [
    ["F090", "Unit F090", "Principles in health and social care"],
    ["F091", "Unit F091", "Anatomy and physiology for health and social care"],
    ["F092", "Unit F092", "Person-centred approach to care"],
    ["F093", "Unit F093", "Supporting people with mental health conditions"]
  ]],
  ["media", "Eduqas", "A Level Media Studies (A680QS)", [
    ["C1", "Component 1", "Investigating the media"],
    ["C2", "Component 2", "Creating a media production"],
    ["C3", "Component 3", "Making media" ]
  ]],
  ["pe", "AQA", "A Level Physical Education (7582)", [
    ["3.1", "Paper 1", "Factors affecting participation in physical activity and sport"],
    ["3.2", "Paper 2", "Factors affecting optimal performance in physical activity and sport"],
    ["3.3", "NEA", "Practical performance and written evaluation"]
  ]],
  ["englit", "AQA", "A Level English Literature (7712)", [
    ["3.1", "Paper 1", "Love through the ages"],
    ["3.2", "Paper 2", "Texts in shared contexts"],
    ["3.3", "NEA", "Independent critical study"]
  ]],
  ["engll", "AQA", "A Level English Language (7707)", [
    ["3.1", "Paper 1", "Language, the individual and society"],
    ["3.2", "Paper 2", "Language varieties"],
    ["3.3", "NEA", "Language investigation and original writing"]
  ]]
];
for (const [subject, board, qualification, points] of remainingAlevelPoints) {
  for (const [code, paper, title] of points) {
    const key = `${board.toLowerCase().replace(/[^a-z]/g, "")}-a-${subject}-${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    SPEC_REGISTRY.points[key] = { subject, board, qualification, paper, code, title, aliases: [] };
  }
}
Object.assign(SPEC_REGISTRY.aliases, {
  "EDEXCEL-9PL0-P1": "edexcel-a-pol-p1-ukpol", "EDEXCEL-9PL0-P2": "edexcel-a-pol-p2-ukgov",
  "EDEXCEL-9PL0-P3-US": "edexcel-a-pol-p3-usgov", "EDEXCEL-9PL0-P3-USPOL": "edexcel-a-pol-p3-uspol",
  "POL-UKPOL": "edexcel-a-pol-p1-ukpol", "POL-UKGOV": "edexcel-a-pol-p2-ukgov",
  "POL-USGOV": "edexcel-a-pol-p3-usgov", "POL-USPOL": "edexcel-a-pol-p3-uspol",
  "RS-1": "eduqas-a-rs-c2", "RS-2": "eduqas-a-rs-c3",
  "HSC-1": "ocr-a-hsc-f090", "HSC-2": "ocr-a-hsc-f092",
  "MEDIA-1": "eduqas-a-media-c1", "MEDIA-2": "eduqas-a-media-c2",
  "PE-1": "aqa-a-pe-3-1", "PE-2": "aqa-a-pe-3-2",
  "ENG-TERM-1": "aqa-a-englit-3-1", "ENG-TECH-1": "aqa-a-englit-3-2"
});

// Selected-route exclusions for option-based A-level subjects. The live banks
// represent the options currently taught at school; the alternatives remain
// in the registry so they can be enabled later without losing board coverage.
for (const [subject, ids, reason] of [
  ["psych", ["3.3.2", "3.3.3", "3.3.5", "3.3.6", "3.3.8", "3.3.10"], "Alternative AQA Psychology option not selected for the delivered route"],
  ["soc", ["3.2.1", "3.2.3", "3.2.4"], "Alternative AQA Sociology option not selected for the delivered route"],
  ["hist", ["NEA.1", "NEA.2", "NEA.3"], "Coursework skill assessed through the History NEA rather than an MCQ bank"]
]) {
  for (const pointId of Object.keys(SPEC_REGISTRY.points)) {
    const point = SPEC_REGISTRY.points[pointId];
    if (point.subject === subject && ids.includes(point.code)) {
      SPEC_REGISTRY.routeExclusions[pointId] = { reason, title: point.title };
    }
  }
}

for (const [subject, codes, reason] of [
  ["media", ["C3"], "Coursework/production component rather than a recall question bank"],
  ["pe", ["3.3"], "Practical performance and written evaluation assessed as NEA"],
  ["englit", ["3.3"], "Independent critical study assessed as NEA"],
  ["engll", ["3.3"], "Language investigation and original writing assessed as NEA"]
]) {
  for (const pointId of Object.keys(SPEC_REGISTRY.points)) {
    const point = SPEC_REGISTRY.points[pointId];
    if (point.subject === subject && codes.includes(point.code)) {
      SPEC_REGISTRY.routeExclusions[pointId] = { reason, title: point.title };
    }
  }
}

// GCSE Phase 4: canonical points for the delivered routes.  These are the
// board's named content sections represented by Forge's existing banks; the
// bank-level aliases preserve the current navigation IDs while giving every
// question a stable specification target.
const gcseSpecRoutes = [
  ["gcse-econ", "OCR", "GCSE Economics (J205)", [
    ["P1-FOUND", "Paper 1", "Introduction to economics"],
    ["P1-MARKETS", "Paper 1", "The role of markets and money"],
    ["P1-DS", "Paper 1", "Demand, supply and price"],
    ["P1-COMP", "Paper 1", "Competition and market structure"],
    ["P1-PROD", "Paper 1", "Production and productivity"],
    ["P1-LABOUR", "Paper 1", "The labour market"],
    ["P1-MONEY", "Paper 1", "Money and financial markets"],
    ["P2-UK", "Paper 2", "Economic objectives and the role of government"],
    ["P2-NATIONAL", "Paper 2", "The national economy"],
    ["P2-GROWTH", "Paper 2", "Economic growth"],
    ["P2-UNEMP", "Paper 2", "Low unemployment"],
    ["P2-INCOME", "Paper 2", "Fair distribution of income"],
    ["P2-PRICE", "Paper 2", "Price stability"],
    ["P2-FISCAL", "Paper 2", "Fiscal policy"],
    ["P2-MONETARY", "Paper 2", "Monetary policy"],
    ["P2-SUPPLY", "Paper 2", "Supply-side policies"],
    ["P2-MARKETFAIL", "Paper 2", "Limitations of markets"],
    ["P2-TRADE", "Paper 2", "International trade"],
    ["P2-BOP", "Paper 2", "Balance of payments"],
    ["P2-EXR", "Paper 2", "Exchange rates"],
    ["P2-GLOBAL", "Paper 2", "Globalisation and the global economy"]
  ]],
  // Edexcel B 1GB0 is three papers: 1 Global Geographical Issues, 2 UK
  // Geographical Issues (which is where BOTH fieldwork enquiries are assessed),
  // 3 People and Environment Issues. Seven of these carried the wrong paper
  // until 2026-08-27 — see scripts/checks/check-paper-mapping.js, which pins
  // the mapping so it cannot drift again.
  ["gcse-geo", "Edexcel", "GCSE Geography B (1GB0)", [
    ["HAZ", "Paper 1", "Hazardous Earth"], ["DEV", "Paper 1", "Development dynamics"],
    ["IND", "Paper 1", "The development of an emerging country: India"],
    ["URB", "Paper 1", "Challenges of an urbanising world"],
    ["UKLAND", "Paper 2", "The UK's evolving physical landscape"],
    ["UKHUMAN", "Paper 2", "The UK's evolving human landscape"],
    ["ENQ", "Paper 2", "Geographical investigations and fieldwork"],
    ["RVF", "Paper 2", "River fieldwork"], ["URF", "Paper 2", "Urban fieldwork"],
    ["BIO", "Paper 3", "People and the biosphere"], ["FOR", "Paper 3", "Forests under threat"],
    ["ENE", "Paper 3", "Consuming energy resources"],
    ["DEC", "Paper 3", "Making geographical decisions"],
    ["SKILLS", "Paper 3", "Geographical skills"]
  ]],
  ["gcse-hist", "AQA", "GCSE History (8145)", [
    ["AMERICA", "Paper 1", "America, 1920–1973: Opportunity and inequality"],
    ["INTERWAR", "Paper 1", "Conflict and tension: the inter-war years, 1918–1939"],
    ["HEALTH", "Paper 2", "Britain: Health and the people, c1000 to the present day"],
    ["ELIZABETH", "Paper 2", "Elizabethan England, c1568–1603"]
  ]],
  ["gcse-psych", "AQA", "GCSE Psychology (8182)", [
    ["MEMORY", "Paper 1", "Memory"], ["PERCEPTION", "Paper 1", "Perception"],
    ["DEVELOPMENT", "Paper 1", "Development"], ["RESEARCH", "Paper 1", "Research methods"],
    ["SOCIAL", "Paper 2", "Social influence"],
    ["LANGUAGE", "Paper 2", "Language, thought and communication"],
    ["BRAIN", "Paper 2", "Brain and neuropsychology"],
    ["PROBLEMS", "Paper 2", "Psychological problems"]
  ]],
  ["gcse-science", "Edexcel", "GCSE Combined Science (1SC0)", [
    ["BIO-1", "Paper 1", "Biology: key concepts and processes"],
    ["CHEM-1", "Paper 2", "Chemistry: key concepts and reactions"],
    ["PHYS-1", "Paper 3", "Physics: motion, energy, waves and radiation"],
    ["BIO-2", "Paper 4", "Biology: coordination, transport and ecosystems"],
    ["CHEM-2", "Paper 5", "Chemistry: groups, rates, fuels and Earth science"],
    ["PHYS-2", "Paper 6", "Physics: electricity, magnetism, particles and forces"]
  ]],
  ["gcse-sep-chem", "Edexcel", "GCSE Chemistry (1CH0)", [
    ["P1", "Paper 1", "Chemistry Paper 1"], ["P2", "Paper 2", "Chemistry Paper 2"]
  ]],
  ["gcse-sep-phys", "Edexcel", "GCSE Physics (1PH0)", [
    ["P1", "Paper 1", "Physics Paper 1"], ["P2", "Paper 2", "Physics Paper 2"]
  ]],
  ["gcse-sep-bio", "Edexcel", "GCSE Biology (1BI0)", [
    ["P1", "Paper 1", "Biology Paper 1"], ["P2", "Paper 2", "Biology Paper 2"]
  ]],
  ["gcse-maths", "Edexcel", "GCSE Mathematics (1MA1)", [
    ["P1", "Paper 1", "Non-calculator content"],
    ["P2", "Paper 2", "Calculator content"], ["P3", "Paper 3", "Calculator content"]
  ]]
];
for (const [subject, board, qualification, points] of gcseSpecRoutes) {
  for (const [code, paper, title] of points) {
    const key = `${board.toLowerCase().replace(/[^a-z]/g, "")}-gcse-${subject.replace(/^gcse-/, "")}-${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    SPEC_REGISTRY.points[key] = { subject, board, qualification, paper, code, title, aliases: [] };
  }
}
const gcseBankMappings = {
  "gcse-econ": ["GCSE-ECON-P1-FOUND","GCSE-ECON-P1-MARKETS","GCSE-ECON-P1-DS","GCSE-ECON-P1-COMP","GCSE-ECON-P1-PROD","GCSE-ECON-P1-LABOUR","GCSE-ECON-P1-MONEY","GCSE-ECON-UK","GCSE-ECON-P2-NATIONAL","GCSE-ECON-P2-GROWTH","GCSE-ECON-P2-UNEMP","GCSE-ECON-P2-INCOME","GCSE-ECON-P2-PRICE","GCSE-ECON-P2-FISCAL","GCSE-ECON-P2-MONETARY","GCSE-ECON-P2-SUPPLY","GCSE-ECON-P2-MARKETFAIL","GCSE-ECON-P2-TRADE","GCSE-ECON-P2-BOP","GCSE-ECON-P2-EXR","GCSE-ECON-P2-GLOBAL"],
  "gcse-geo": ["GCSE-GEO-HAZ","GCSE-GEO-DEV","GCSE-GEO-INDIA","GCSE-GEO-URB","GCSE-GEO-UKLAND","GCSE-GEO-UKHUMAN","GCSE-GEO-ENQUIRY","GCSE-GEO-RIVERFIELD","GCSE-GEO-URBFIELD","GCSE-GEO-BIOSPHERE","GCSE-GEO-FORESTS","GCSE-GEO-ENERGY","GCSE-GEO-DECISIONS","GCSE-GEO-SKILLS"],
  "gcse-hist": ["GCSE-HIST-AMERICA","GCSE-HIST-INTERWAR","GCSE-HIST-HEALTH","GCSE-HIST-ELIZABETH"],
  "gcse-psych": ["GCSE-PSY-MEMORY","GCSE-PSY-PERCEPTION","GCSE-PSY-DEVELOPMENT","GCSE-PSY-RESEARCH","GCSE-PSY-SOCIAL","GCSE-PSY-LANGUAGE","GCSE-PSY-BRAIN","GCSE-PSY-PROBLEMS"],
  "gcse-science": ["GCSE-SCI-BIO-1","GCSE-SCI-CHEM-1","GCSE-SCI-PHYS-1","GCSE-SCI-BIO-2","GCSE-SCI-CHEM-2","GCSE-SCI-PHYS-2"],
  "gcse-sep-chem": ["GCSE-SEP-CHEM-1","GCSE-SEP-CHEM-2"],
  "gcse-sep-phys": ["GCSE-SEP-PHYS-1","GCSE-SEP-PHYS-2"],
  "gcse-sep-bio": ["GCSE-SEP-BIO-1","GCSE-SEP-BIO-2"],
  "gcse-maths": ["GCSE-MATH-P1","GCSE-MATH-P2","GCSE-MATH-P3"]
};
for (const [subject, bankIds] of Object.entries(gcseBankMappings)) {
  const route = gcseSpecRoutes.find(item => item[0] === subject);
  const [, board] = route;
  const points = route[3];
  bankIds.forEach((bankId, index) => {
    const [code] = points[index];
    const pointId = `${board.toLowerCase().replace(/[^a-z]/g, "")}-gcse-${subject.replace(/^gcse-/, "")}-${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    SPEC_REGISTRY.aliases[bankId] = pointId;
  });
}

const csProjectPoint = Object.entries(SPEC_REGISTRY.points)
  .find(([, point]) => point.subject === "cs" && point.code === "3.1");
if (csProjectPoint) {
  SPEC_REGISTRY.routeExclusions[csProjectPoint[0]] = {
    reason: "Programming project assessed as Eduqas Component 3 coursework rather than a recall bank",
    title: csProjectPoint[1].title
  };
}
