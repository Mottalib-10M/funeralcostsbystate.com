# Audit réglementaire de funeralcostsbystate.com (RECETTE §17.4), 9 novembre 2026

Fait le 2026-11-09, sur le moteur `src/lib/engine/funeral.ts` et le fichier `src/data/params-2026.json`
(`retrieved_at` 2026-11-07). Chaque source officielle a été relue par `curl` le 2026-11-09 (User-Agent de navigateur).
Prochain audit : à chaque 1er octobre (montants VA et pierre tombale), à la publication des tables NCHS et de
l'indice BLS de l'année, et au 1er janvier (IRS).

## 1. Paramètres confrontés à la source (point 1)

| Paramètre | Valeur du fichier | Source relue le 2026-11-09 | Résultat |
|---|---|---|---|
| VA, décès lié au service, après le 11/09/2001 / avant | 2 000 $ / 1 500 $ | va.gov, Veterans burial allowance (« Last updated: October 30, 2026 ») | conforme |
| VA, décès non lié au service, décès à partir du 01/10/2026 | 1 032 $ + 1 032 $ (parcelle) | même page : « We’ll pay a $1,032 burial allowance and $1,032 for a plot » | conforme |
| VA, même cas, 01/10/2025 et 01/10/2024 | 1 002 + 1 002 ; 978 + 978 | même page | conforme |
| VA, allocation pierre tombale ou plaque | 420 $ (01/10/2026), 441 $ (01/10/2025), 371 $ (01/10/2024) | même page, tableau « Headstone or marker allowance amounts » | conforme ; la baisse de 441 à 420 $ est celle de va.gov, désormais expliquée sur la page VA du site |
| VA, délai de demande (non lié au service) | 2 ans après l'inhumation, sans délai pour un décès lié au service | même page : « within 2 years after the Veteran’s burial, unless… » ; « There’s no time limit if the Veteran’s death was service connected » | conforme |
| Social Security, versement forfaitaire | 255 $ | eCFR, 20 CFR 404.390 : « a lump-sum death payment of $255 » | conforme |
| Social Security, bénéficiaires et délai | conjoint vivant sous le même toit, sinon conjoint ou enfant ayant droit à une prestation sur le compte ; demande dans les 2 ans | eCFR, 20 CFR 404.391 et 404.392 (« an application must be filed within 2 years of the insured's death ») | conforme |
| IRS, exclusion de base 2026 / exclusion annuelle | 15 000 000 $ / 19 000 $ | irs.gov, What's new: estate and gift tax (« increasing the basic exclusion amount to $15,000,000 for calendar year 2026 » ; tableau 2026 : 19 000 $) | conforme |
| IRS, Table 2-2 (coût mensuel pour 1 000 $) | 0,05 à 2,06 $ selon l'âge | irs.gov, Publication 15-B, Table 2-2 (« Under 25 $0.05 … 70 and older 2.06 ») | conforme, onze tranches |
| FTC Funeral Rule | prix par téléphone, liste générale de prix, conteneur alternatif, embaumement non exigé sauf loi | eCFR, 16 CFR 453.2 (b)(1) « Telephone price disclosure », 453.1 « alternative container », 453.5 | conforme aux phrases du site |

Données (Census 2022 EC2281BASIC, estimations de population Vintage 2024, tables NCHS 2022 par État et 2024
États-Unis, indice BLS CUUR0000SEGD02) : contrôlées par les tests `tests/engine.test.ts` (valeurs publiées relues :
Texas 1 726 191 000 $, États-Unis 23 396 061 000 $, q65 et e65 NCHS, base 100 de décembre 1986).

## 2. Fiches en retard, réformes datées (points 2, 3, 11)

- Montants VA non liés au service : révisés chaque 1er octobre. Codés avec leur date d'effet (`nonService[].from`),
  testés des deux côtés du 01/10/2026 (1 032 $ / 1 002 $) et du 05/01/2023 (fin du barème « hospitalisé par la VA »).
- Aucune réforme 2026 trouvée sur le versement de 255 $ (montant fixé par la réglementation depuis 1979-1983).
- Exclusion fédérale 2026 portée à 15 000 000 $ par la loi citée par l'IRS (« WFTC amends § 2010(c)(3) ») : appliquée.

## 3. Bornes (point 4)

Sondées par les tests : reste à payer jamais négatif (épargne supérieure au coût) ; âge 100 et au-delà (table close à
100 ans) ; décès VA juste avant et juste après le 01/10/2026 ; décès lié au service avant et après le 11/09/2001 ;
Table 2-2 à 24/25 ans et à 70 ans ; succession juste sous l'exclusion (impôt nul) et au-dessus (40 %) ; tranche
de 1 000 000 $ du Form 706 (345 800 $) ; rachat avec perte (impôt nul) ; IUL au plancher et au plafond.

## 4. Exemples officiels devenus tests (point 5)

IRS Publication 15-B, exemple « Tom, 45 ans, 200 000 $ de couverture, 100 $ payés » : 170 $ imposables
(`tests/engine.test.ts`). Form 706, Table A : 345 800 $ sur le premier million.

## 5. Pages relues contre le moteur (points 6 et 7)

- **Défaut trouvé et corrigé** : l'accueil affichait 10 426 $ dans le calculateur et 10 407 $ dans le texte pour le
  même cas (tendance arrondie à 2,6 % contre tendance exacte 2,593 %), et la page prépayée 9 804 $ contre 9 792 $
  (même cause, plus un âge tronqué à 87 contre 87,5). Correction : le champ affiche 2,6 % mais, non modifié, le
  moteur garde la tendance exacte (`trendFromField`) ; le calculateur prépayé et le tableau appellent la même fonction
  (`prepaidCase`). Verrou : `tests/coherence-texte-calculateur.test.ts` rend les calculateurs et compare leurs chiffres
  au texte des pages et au HTML construit.
- **Valeur par défaut trompeuse corrigée** : le versement Social Security de 255 $ était compté d'office (accueil,
  crémation, VA). Il ne l'est plus : la question « A surviving husband or wife, or a child under 18? » part de « No ».
- Aucun montant réglementaire tapé dans une page : contrôle `tests/pages.test.ts` (`TYPED`), qui couvre 1 032, 1 002,
  2 000, 1 500, 255, 15 000 000, 19 000, 420, la Table 2-2 et le 1er octobre 2026.
- Les questions qui changent le droit sont dans le formulaire (§17.3) : nature du décès (lié au service ou non) et
  conditions VA dans le libellé du choix ; conjoint ou enfant pour les 255 $.

## 6. Simplifications assumées (point 9)

- Conditions VA pour un décès non lié au service (pension, compensation, demande en cours, soins VA) : déclarées par
  le visiteur dans le choix, non vérifiées.
- Enfant ayant droit aux 255 $ : résumé « under 18 » dans le libellé ; la règle exacte (enfant ayant droit à une
  prestation sur le compte, 20 CFR 404.350) est écrite sur la carte « Social Security lump sum » de l'accueil.
- Indice des prix des obsèques national appliqué à tous les États (le BLS ne publie pas d'indice par État).

## 7. Sources qui répondent (point 15)

va.gov, ecfr.gov (API de rendu), irs.gov (Publication 15-B, page estate and gift tax) : réponse 200 le 2026-11-09.
`check-sources.mjs` les contrôle à chaque `npm run check`.
