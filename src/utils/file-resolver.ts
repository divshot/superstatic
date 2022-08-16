/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://github.com/firebase/superstatic/blob/master/LICENSE
 */

import { join } from "node:path";

/**
 * Uses the provider to look for a file given a path.
 * This also takes into account i18n settings.
 * @param req the Request.
 * @param res the Response.
 * @param p the path to search for.
 * @return a non-null value if a file is found.
 */
export async function providerResult(
  req: any,
  res: any,
  p: string
): Promise<ReadableStream | undefined> {
  const promises: Promise<ReadableStream | undefined>[] = [];

  const i18n = req.superstatic.i18n;
  if (i18n && i18n.root) {
    const country = getCountryCode(req.headers);
    const languages = getI18nLanguages(req.headers);
    const paths = i18nContentOptions(p, country, languages, i18n);
    for (const pth of paths) {
      promises.push(res.superstatic.provider(req, pth));
    }
  }

  promises.push(res.superstatic.provider(req, p));
  const results = await Promise.all(promises);
  for (const r of results) {
    if (r) {
      return r;
    }
  }
}

/**
 * Returns the list of paths to check for i18n content.
 * The path order is:
 * (1) root/language_country/path (for each language)
 * (2) root/ALL_country/path (if country is set)
 * (3) root/language_ALL/path or root/language/path (for each language)
 * @param p requested path.
 * @param country country code.
 * @param languages languages accepted in the response.
 * @param i18n i18n config.
 * @param i18n.root i18n root path.
 * @return list of paths to check for i18n content.
 */
function i18nContentOptions(
  p: string,
  country: string,
  languages: string[],
  i18n: { root: string }
): string[] {
  const paths: string[] = [];
  // (1)
  if (country) {
    for (const l of languages) {
      paths.push(join(i18n.root, `${l}_${country}`, p));
    }
    // (2)
    paths.push(join(i18n.root, `ALL_${country}`, p));
  }
  // (3)
  for (const l of languages) {
    paths.push(join(i18n.root, `${l}_ALL`, p));
    paths.push(join(i18n.root, `${l}`, p));
  }
  return paths;
}

/**
 * Fetches the country code from the headers object.
 * @param headers headers from the request.
 * @return country code, or an empty string.
 */
function getCountryCode(headers: Record<string, string>): string {
  const overrideValue = cookieValue(
    headers.cookie,
    "firebase-country-override"
  );
  if (overrideValue) {
    return overrideValue;
  }
  return headers["x-country-code"] || "";
}

/**
 * Fetches the languages from the accept-language header.
 * @param headers headers from the request.
 * @return ordered list of languages from the header.
 */
function getI18nLanguages(headers: Record<string, string>): string[] {
  const overrideValue = cookieValue(
    headers.cookie,
    "firebase-language-override"
  );
  if (overrideValue) {
    return overrideValue.includes(",")
      ? overrideValue.split(",")
      : [overrideValue];
  }

  const acceptLanguage = headers["accept-language"];
  if (!acceptLanguage) {
    return [];
  }

  const languagesSeen = new Set<string>();
  const languagesOrdered = [];
  for (const v of acceptLanguage.split(",")) {
    const l = v.split("-")[0];
    if (!l) {
      continue;
    }
    if (!languagesSeen.has(l)) {
      languagesOrdered.push(l);
    }
    languagesSeen.add(l);
  }
  return languagesOrdered;
}

/**
 * Fetches a value from a cookie string.
 * @param cookieString full cookie string.
 * @param key key to look for.
 * @return the value, or empty string;
 */
function cookieValue(cookieString: string, key: string): string {
  if (!cookieString) {
    return "";
  }
  const cookies = cookieString.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(key)) {
      const s = cookie.split("=", 2);
      return s.length === 2 ? s[1] : "";
    }
  }
  return "";
}
