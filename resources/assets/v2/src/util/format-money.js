/*
 * format-money.js
 * Copyright (c) 2023 james@firefly-iii.org
 *
 * This file is part of Firefly III (https://github.com/firefly-iii).
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export default function (amount, currencyCode) {
    if ((typeof amount !== 'number' && typeof amount !== 'string') || isNaN(amount)) {
        return '';
    }
    if (typeof currencyCode !== 'string' || currencyCode.length !== 3) {
        return String(amount);
    }
    const locale = (window.__localeId__ ?? 'en_US').replace('_', '-');
    try {
        return Intl.NumberFormat(locale, {style: 'currency', currency: currencyCode}).format(amount);
    } catch {
        return Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(amount);
    }
}
