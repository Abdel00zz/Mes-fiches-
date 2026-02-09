# Guide Robot v4 — Génération JSON pour FicheBuilder

## Format du contenu

Le champ `content` utilise du **texte brut + LaTeX**. Pas de HTML.

- Retour à la ligne : `\n`
- Gras : `**texte**`
- LaTeX inline : `$formule$`
- LaTeX display : `$$formule$$`
- Formules clés : `$$\boxed{formule}$$`
- `title` : toujours `""` (vide) — la numérotation est automatique

---

## Structures LaTeX disponibles

### Listes à puces : `\begin{itemize}`

```
\\begin{itemize}\n\\item Premier point\n\\item Deuxième point\n\\end{itemize}
```

Utiliser pour : propriétés listées, remarques, conditions.

### Listes numérotées : `\begin{enumerate}`

```
\\begin{enumerate}\n\\item $f(x) = x^2$ et $a = 1$\n\\item $f(x) = \\sin x$ et $a = 0$\n\\end{enumerate}
```

Utiliser pour : exercices numérotés, étapes d'une démonstration.

### Tableaux : `\begin{array}`

```
$$\\begin{array}{|c|c|c|}\n\\hline\nf(x) & f'(x) & \\text{Domaine} \\\\\n\\hline\nx^n & nx^{n-1} & \\mathbb{R} \\\\\n\\hline\n\\end{array}$$
```

Utiliser pour : tableaux de dérivées, tableaux de valeurs.

### Fonctions par morceaux : `\begin{cases}`

```
$f(x) = \\begin{cases} x^3 & \\text{si } x \\geq 0 \\\\ x^2 & \\text{si } x < 0 \\end{cases}$
```

Utiliser pour : fonctions définies par morceaux, systèmes.

### Quand utiliser quoi

| Structure | Quand |
|-----------|-------|
| `\begin{enumerate}` | Exercices à résoudre (a, b, c...) |
| `\begin{itemize}` | Liste de propriétés, conditions, remarques |
| `\begin{array}` | Tableau de dérivées, tableau de valeurs |
| `\begin{cases}` | Fonctions par morceaux, systèmes d'équations |
| `\boxed{}` | Formule clé à retenir |
| `\displaystyle` | Fractions inline lisibles |

### Règle : pas de sur-utilisation

- `\enumerate` pour les exercices : OUI
- `\enumerate` pour une seule question : NON (texte simple)
- `\itemize` pour 2+ items de propriétés : OUI
- `\itemize` pour du texte continu : NON
- `\array` pour un vrai tableau : OUI
- `\array` pour 2 éléments : NON

---

## Structure JSON

```json
{
  "title": "Titre du chapitre",
  "subtitle": "Description",
  "blocks": [
    {
      "id": "identifiant",
      "type": "definition|propriete|theoreme|application|activite|exemple|remarque|section",
      "title": "",
      "content": "Texte + $LaTeX$ + \\begin{enumerate}...\\end{enumerate}",
      "zones": [{ "id": "z1", "height": 35, "style": "lines" }],
      "images": []
    }
  ]
}
```

Règles :
- `title` : toujours `""` (vide). L'application numérote automatiquement
- Chaque bloc a : `id`, `type`, `title`, `content`, `zones`, `images`
- `zones` : tableau vide `[]` si pas de zone réponse
- `images` : tableau vide `[]` si pas d'image

---

## Types de blocs

| Type | Usage |
|------|-------|
| `section` | Séparateur de titre (I, II, III...) |
| `activite` | Questions, prérequis, synthèse |
| `definition` | Définitions formelles |
| `propriete` | Propriétés, lemmes |
| `theoreme` | Théorèmes majeurs, formules clés |
| `application` | Exercices (corrigé + à faire) |
| `exemple` | Correction détaillée autonome |
| `remarque` | Transitions, notes, méthodes |

---

## Zones de réponse

| Hauteur (mm) | Style | Quand |
|-------------|-------|-------|
| 12-16 | `lines` | Réponse courte, compléter |
| 20-28 | `lines` | Calcul simple |
| 30-40 | `lines` | Raisonnement, dérivation |
| 30-40 | `grid` | Tableau de variation/signes |
| 45-60 | `lines` | Démonstration, récurrence |
| 60-80 | `dots` | Graphique, courbe |

---

## Pédagogie

### Ordre obligatoire

1. **Prérequis** : questions actives (pas de rappels passifs)
2. **Définition** → immédiatement suivie d'une **application**
3. **Propriétés/Théorèmes** → toujours suivis d'**applications**
4. **Synthèse** : étude complète mobilisant toutes les notions

### Exemples corrigés

Intégrés dans les blocs `application` :

```
**Exemple :** $f(x) = x^2$, $f'(3) = 6$ car $\\frac{(3+h)^2-9}{h} = 6+h \\to 6$.\n\nÉtudier la dérivabilité...
```

### Questions intelligentes

Mauvais : "Rappel : $(x^n)' = nx^{n-1}$"
Bon : "Compléter : $(x^n)' = ...$" + zone réponse 14mm

---

## LaTeX en JSON — Échappement

| Normal | JSON |
|--------|------|
| `\frac` | `\\frac` |
| `\lim_{x\to 0}` | `\\lim_{x \\to 0}` |
| `\begin{cases}` | `\\begin{cases}` |
| `\end{cases}` | `\\end{cases}` |
| `\begin{enumerate}` | `\\begin{enumerate}` |
| `\item` | `\\item` |
| `\text{si}` | `\\text{si }` |
| `\\` (retour ligne LaTeX) | `\\\\` |
| `\hline` | `\\hline` |

Attention : `\t` = tabulation en JSON. Toujours `\\to`, `\\text`, `\\tan`.

---

## Exemples de référence

### Exercices numérotés avec enumerate

```json
{
  "id": "app_deriv",
  "type": "application",
  "title": "",
  "content": "Calculer $f'(a)$ :\n\\begin{enumerate}\n\\item $f(x) = 3x^2 + 2x - 1$ et $a = \\sqrt{2}$\n\\item $f(x) = |x^2 - 2x|$ et $a = 0$\n\\item $f(x) = \\frac{x+1}{x-5}$ et $a = \\frac{2}{3}$\n\\end{enumerate}",
  "zones": [
    { "id": "z1", "height": 35, "style": "lines" },
    { "id": "z2", "height": 40, "style": "lines" },
    { "id": "z3", "height": 35, "style": "lines" }
  ],
  "images": []
}
```

### Tableau de dérivées avec array

```json
{
  "id": "prop_tab",
  "type": "propriete",
  "title": "",
  "content": "$$\\begin{array}{|c|c|c|}\\hline f & f' & \\text{Domaine} \\\\\\hline x^n & nx^{n-1} & \\mathbb{R} \\\\\\hline \\sqrt{x} & \\frac{1}{2\\sqrt{x}} & \\mathbb{R}^{*+} \\\\\\hline\\end{array}$$",
  "zones": [],
  "images": []
}
```

### Fonction par morceaux avec cases

```json
{
  "id": "app_dg",
  "type": "application",
  "title": "",
  "content": "Étudier la dérivabilité à droite et à gauche :\n$f(x) = \\begin{cases} x^3 & \\text{si } x \\geq -1 \\\\ x^2 - 2 & \\text{si } x < -1 \\end{cases}$ et $a = -1$",
  "zones": [{ "id": "z1", "height": 40, "style": "lines" }],
  "images": []
}
```

### Propriétés avec itemize

```json
{
  "id": "th_mono",
  "type": "theoreme",
  "title": "",
  "content": "Soit $f$ dérivable sur $I$ :\n\\begin{itemize}\n\\item $f'(x) > 0$ sur $I$ $\\implies$ $f$ strictement croissante\n\\item $f'(x) < 0$ sur $I$ $\\implies$ $f$ strictement décroissante\n\\item $f'(x) = 0$ sur $I$ $\\implies$ $f$ constante\n\\end{itemize}",
  "zones": [],
  "images": []
}
```

---

## Checklist

- [ ] Chaque bloc a `id`, `type`, `title: ""`, `content`, `zones`, `images`
- [ ] `content` en texte + LaTeX (pas de HTML)
- [ ] `\n` pour retours à la ligne
- [ ] Backslashes doublés dans tout le LaTeX
- [ ] `\begin{enumerate}` pour exercices numérotés
- [ ] `\begin{itemize}` pour listes de propriétés
- [ ] `\begin{array}` pour tableaux
- [ ] `\begin{cases}` pour fonctions par morceaux
- [ ] `\boxed{}` pour formules clés
- [ ] Zones calibrées et variées
- [ ] Au moins 1 exemple corrigé par section
- [ ] Prérequis en section 1, synthèse en dernière section
- [ ] Titres vides `""` (numérotation automatique)
