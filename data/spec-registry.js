// Canonical exam-board specification metadata for Forge.
//
// This file deliberately contains specification structure, not question data.
// Question banks may keep their existing `spec` value while a subject is
// migrated; validation resolves that value through this registry.  Once a
// subject is fully migrated, questions can additionally use `specPointId`.

const SPEC_REGISTRY = {
  version: 1,
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
  ["Paper 1", "1", "Tectonic Processes and Hazards", 6],
  ["Paper 1", "2A", "Glaciated Landscapes and Change", 12],
  ["Paper 1", "2B", "Coastal Landscapes and Change", 12],
  ["Paper 2", "3", "Globalisation", 5],
  ["Paper 2", "4A", "Regenerating Places", 12],
  ["Paper 2", "4B", "Diverse Places", 10],
  ["Paper 1", "5", "The Water Cycle and Water Insecurity", 6],
  ["Paper 1", "6", "The Carbon Cycle and Energy Security", 4],
  ["Paper 2", "7", "Superpowers", 6],
  ["Paper 2", "8A", "Health, Human Rights and Intervention", 12],
  ["Paper 2", "8B", "Migration, Identity and Sovereignty", 11]
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
  "9GE0-HEALTH": "edexcel-a-geo-topic-8a"
});
