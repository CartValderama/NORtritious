// The two Lovdata documents the calculator judges against, one link per ruleset rather than
// one per claim.
//
// Pinpointing an individual claim would need Lovdata's query API, which is open only to a
// paid account, so each link goes to the table the thresholds are actually read from. For
// Nøkkelhullet that is vedlegg 2, which lists the næringsmiddelgrupper and the vilkår that
// apply to each one. For ernæringspåstander it is the vedlegg to forordning (EF) nr.
// 1924/2006, which lists every påstand together with the vilkår for using it.
//
// A link rather than a quoted figure, on purpose. Lovdata serves the consolidated text, so
// the reader always lands on what applies today, where a number copied into this project
// would go stale the next time the forskrift is amended without saying so.
//
// Helsepåstander are deliberately absent. Those cards already link the forordning that
// authorises each individual claim, because the EU register hands us that reference per
// claim.
export type RegulationSource = {
  readonly url: string;
  readonly label: string;
};

export const NOKKELHULLET_SOURCE: RegulationSource = {
  url: "https://lovdata.no/dokument/SF/forskrift/2015-02-18-139/KAPITTEL_2",
  label: "Les vilkårene i Nøkkelhullforskriften på Lovdata",
};

export const NUTRITION_CLAIMS_SOURCE: RegulationSource = {
  url: "https://lovdata.no/dokument/SF/forskrift/2010-02-17-187/KAPITTEL_1-1-1-6",
  label: "Les vilkårene for ernæringspåstander på Lovdata",
};
